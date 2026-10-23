"""Builds the data, statistics and charts behind the two simulated case studies.

    .venv/bin/python analysis/build_case_studies.py

Case study 01: defect reduction on an injection-molded part (Pareto, MSA, SPC,
capability, regression, before/after). Case study 02: an OEE data model for
Power BI, plus the JSON that drives the web preview of the dashboard.

Every number on the case-study pages is printed by this script. The data is
simulated with a fixed seed, so rerunning it reproduces the pages exactly.
"""
import json
import sqlite3
from math import erf, sqrt
from pathlib import Path

import matplotlib
matplotlib.use('svg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
CHARTS = ROOT / 'projects' / 'charts'
for folder in (DATA / 'defect-reduction', DATA / 'oee-powerbi', CHARTS):
    folder.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(42)

# Chart palette: validated categorical slots (blue, copper) + text inks.
BLUE, COPPER = '#3560a8', '#c46a35'
INK, MUTED, GRID, GRAY = '#102a43', '#526777', '#e3e7e9', '#b8c2c9'
plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'font.size': 11, 'text.color': INK, 'axes.labelcolor': MUTED,
    'axes.edgecolor': GRAY, 'axes.linewidth': .8, 'xtick.color': MUTED, 'ytick.color': MUTED,
    'axes.spines.top': False, 'axes.spines.right': False, 'axes.grid': True, 'axes.grid.axis': 'y',
    'grid.color': GRID, 'grid.linewidth': .8, 'axes.axisbelow': True,
    'svg.fonttype': 'none', 'svg.hashsalt': 'portfolio', 'figure.facecolor': 'none', 'axes.facecolor': 'none',
})


def save(fig, name):
    fig.savefig(CHARTS / name, bbox_inches='tight', metadata={'Date': None})
    plt.close(fig)
    # Layout is measured with DejaVu Sans (wide), then shown in the system UI font.
    svg = (CHARTS / name).read_text().replace("'DejaVu Sans'", "'Segoe UI', Helvetica, Arial, sans-serif")
    (CHARTS / name).write_text(svg)


def cdf(z):
    return 0.5 * (1 + erf(z / sqrt(2)))


# ---------------------------------------------------------------- Case study 01
LSL, TARGET, USL = 2.40, 2.50, 2.60          # flange thickness, mm
MACHINES = ['IMM-1', 'IMM-2', 'IMM-3', 'IMM-4']
SHIFTS = ['A', 'B', 'C']
BASE_WEEKS, AFTER_WEEKS = range(1, 9), range(11, 15)  # weeks 9-10: implementation
CATEGORIES = ['Dimensional', 'Short shot', 'Sink marks', 'Flash', 'Warpage', 'Other']
PART_SIGMA = 0.020                           # within-lot thickness variation, mm


def thickness_mean(hold, mold, melt):
    # Ground truth the analysis has to recover: hold pressure and mold temperature drive thickness.
    return TARGET + 0.0030 * (hold - 600) - 0.008 * (mold - 45) + 0.0004 * (melt - 230)


lots, subgroups = [], []
for week in [*BASE_WEEKS, *AFTER_WEEKS]:
    after = week in AFTER_WEEKS
    phase = 'After' if after else 'Baseline'
    for day in range(6):
        date = (pd.Timestamp('2026-01-05') + pd.Timedelta(days=(week - 1) * 7 + day)).date().isoformat()
        for machine in MACHINES:
            for shift in SHIFTS:
                worn = machine == 'IMM-3' and not after   # worn check ring: pressure loss + variability
                hold = 600 + (rng.normal(-7, 12) if worn else rng.normal(0, 4 if after else 6))
                mold = 45 + (1.2 if shift == 'C' and not after else 0) + rng.normal(0, .9 if after else 1.3)
                melt = 230 + rng.normal(0, 3)
                cooling = 18 + rng.normal(0, .3)
                moisture = rng.uniform(.015, .035) if after else rng.uniform(.015, .07)
                mean = thickness_mean(hold, mold, melt)
                produced = int(rng.normal(1200, 30))
                low = max(0, 600 - hold) / 10
                rates = {
                    'Dimensional': cdf((LSL - mean) / PART_SIGMA) + 1 - cdf((USL - mean) / PART_SIGMA),
                    'Short shot': .006 + .003 * low + .10 * max(0, moisture - .04),
                    'Sink marks': .005 + .002 * low,
                    'Flash': .003 + .0015 * max(0, hold - 608) / 10,
                    'Warpage': .003 + .002 * max(0, mold - 46),
                    'Other': .004,
                }
                counts = {k: int(rng.binomial(produced, min(p, .5))) for k, p in rates.items()}
                lots.append({
                    'date': date, 'week': week, 'phase': phase, 'machine': machine, 'shift': shift,
                    'resin_moisture_pct': round(moisture, 3), 'hold_pressure_bar': round(hold, 1),
                    'mold_temp_c': round(mold, 2), 'melt_temp_c': round(melt, 1), 'cooling_time_s': round(cooling, 2),
                    'produced': produced, **counts, 'rejected': sum(counts.values()),
                })
                sample = rng.normal(mean, PART_SIGMA, 5).round(3)   # one subgroup of 5 per lot
                subgroups.append({'date': date, 'week': week, 'phase': phase, 'machine': machine, 'shift': shift,
                                  **{f'x{i + 1}': v for i, v in enumerate(sample)}})

lots = pd.DataFrame(lots)
subgroups = pd.DataFrame(subgroups)
lots.to_csv(DATA / 'defect-reduction' / 'molding_lots.csv', index=False)
subgroups.to_csv(DATA / 'defect-reduction' / 'thickness_subgroups.csv', index=False)
X = [f'x{i}' for i in range(1, 6)]
subgroups['xbar'] = subgroups[X].mean(axis=1)
subgroups['range'] = subgroups[X].max(axis=1) - subgroups[X].min(axis=1)

base, after = lots[lots.phase == 'Baseline'], lots[lots.phase == 'After']


def reject_rate(df):
    return df.rejected.sum() / df.produced.sum()


results = {'defect': {}, 'oee': {}}
R = results['defect']
R['baseline_reject_pct'] = 100 * reject_rate(base)
R['after_reject_pct'] = 100 * reject_rate(after)
R['relative_reduction_pct'] = 100 * (1 - reject_rate(after) / reject_rate(base))
R['baseline_parts'] = int(base.produced.sum())
R['after_parts'] = int(after.produced.sum())
R['after_by_category'] = after[CATEGORIES].sum().to_dict()

# Pareto (baseline). Cumulative share sits on its own 0-100% scale: the Pareto convention.
pareto = base[CATEGORIES].sum().sort_values(ascending=False)
share = 100 * pareto / pareto.sum()
R['pareto'] = {k: [int(pareto[k]), share[k]] for k in pareto.index}
fig, ax = plt.subplots(figsize=(7.2, 3.6))
ax.bar(pareto.index, pareto.values, width=.62, edgecolor='white', linewidth=2,
       color=[COPPER if i < 2 else GRAY for i in range(len(pareto))])
for i, v in enumerate(pareto.values):
    ax.text(i, v, f'{share.iloc[i]:.0f}%', ha='center', va='bottom', fontsize=10, color=INK)
ax2 = ax.twinx()
ax2.plot(pareto.index, share.cumsum().values, color=INK, linewidth=1.6, marker='o', markersize=4)
ax2.set_ylim(0, 105); ax2.set_yticks([0, 50, 80, 100]); ax2.set_yticklabels(['0%', '50%', '80%', '100%'])
ax2.spines[['top']].set_visible(False); ax2.grid(False)
ax.set_ylabel('Rejected parts'); ax2.set_ylabel('Cumulative share')
ax.tick_params(axis='x', length=0)
save(fig, 'cs1-pareto.svg')

# Stratification by machine and shift (baseline)
by_machine = base.groupby('machine').apply(reject_rate, include_groups=False) * 100
by_shift = base.groupby('shift').apply(reject_rate, include_groups=False) * 100
R['by_machine'] = by_machine.to_dict()
R['by_shift'] = by_shift.to_dict()
R['imm3_share_of_rejects_pct'] = 100 * base[base.machine == 'IMM-3'].rejected.sum() / base.rejected.sum()
fig, ax = plt.subplots(figsize=(7.2, 3.0))
ax.bar(by_machine.index, by_machine.values, width=.55, edgecolor='white', linewidth=2,
       color=[COPPER if m == by_machine.idxmax() else GRAY for m in by_machine.index])
for i, v in enumerate(by_machine.values):
    ax.text(i, v, f'{v:.1f}%', ha='center', va='bottom', fontsize=10, color=INK)
ax.set_ylabel('Reject rate'); ax.yaxis.set_major_formatter(lambda v, _: f'{v:.0f}%')
ax.tick_params(axis='x', length=0)
save(fig, 'cs1-by-machine.svg')

# MSA: crossed Gage R&R (10 parts x 3 appraisers x 3 trials), ANOVA method
parts = rng.normal(TARGET, .035, 10)
bias = {'Op 1': 0.0, 'Op 2': .0025, 'Op 3': -.0015}
grr = pd.DataFrame([{'part': p + 1, 'operator': o, 'trial': t + 1,
                     'thickness_mm': round(parts[p] + b + rng.normal(0, .0045), 4)}
                    for p in range(10) for o, b in bias.items() for t in range(3)])
grr.to_csv(DATA / 'defect-reduction' / 'gage_rr.csv', index=False)
n_p, n_o, n_r = 10, 3, 3
y = grr.thickness_mm
grand = y.mean()
ss_p = n_o * n_r * ((grr.groupby('part').thickness_mm.mean() - grand) ** 2).sum()
ss_o = n_p * n_r * ((grr.groupby('operator').thickness_mm.mean() - grand) ** 2).sum()
ss_cells = n_r * ((grr.groupby(['part', 'operator']).thickness_mm.mean() - grand) ** 2).sum()
ss_po = ss_cells - ss_p - ss_o
ss_e = ((y - grr.groupby(['part', 'operator']).thickness_mm.transform('mean')) ** 2).sum()
ms_p, ms_o = ss_p / (n_p - 1), ss_o / (n_o - 1)
ms_po, ms_e = ss_po / ((n_p - 1) * (n_o - 1)), ss_e / (n_p * n_o * (n_r - 1))
var_repeat = ms_e
var_po = max(0, (ms_po - ms_e) / n_r)
var_oper = max(0, (ms_o - ms_po) / (n_p * n_r))
var_part = max(0, (ms_p - ms_po) / (n_o * n_r))
var_grr = var_repeat + var_oper + var_po
var_total = var_grr + var_part
R['msa'] = {
    'pct_contribution_grr': 100 * var_grr / var_total,
    'pct_study_var_grr': 100 * np.sqrt(var_grr / var_total),
    'pct_study_var_repeat': 100 * np.sqrt(var_repeat / var_total),
    'pct_study_var_reprod': 100 * np.sqrt((var_oper + var_po) / var_total),
    'pct_study_var_part': 100 * np.sqrt(var_part / var_total),
    'pct_tolerance_grr': 100 * 6 * np.sqrt(var_grr) / (USL - LSL),
    'ndc': int(1.41 * np.sqrt(var_part / var_grr)),
}

# SPC: X-bar/R chart, IMM-3, first 30 baseline subgroups (phase I limits)
A2, D4, d2 = .577, 2.114, 2.326        # constants for n = 5 (D3 = 0)
spc = subgroups[(subgroups.machine == 'IMM-3') & (subgroups.phase == 'Baseline')].head(30).reset_index(drop=True)
xbb, rbar = spc.xbar.mean(), spc['range'].mean()
ucl, lcl = xbb + A2 * rbar, xbb - A2 * rbar
out = ((spc.xbar > ucl) | (spc.xbar < lcl)).to_numpy()
R['spc'] = {'xbarbar': xbb, 'ucl': ucl, 'lcl': lcl, 'rbar': rbar, 'r_ucl': D4 * rbar,
            'points_out': int(out.sum()), 'r_out': int((spc['range'] > D4 * rbar).sum())}
fig, (a1, a2) = plt.subplots(2, 1, figsize=(7.2, 4.8), sharex=True, gridspec_kw={'height_ratios': [3, 2], 'hspace': .18})
idx = np.arange(1, len(spc) + 1)
a1.plot(idx, spc.xbar, color=BLUE, linewidth=1.6, marker='o', markersize=4.5, zorder=2)
a1.scatter(idx[out], spc.xbar[out], s=70, marker='s', color=COPPER, edgecolor='white', linewidth=1.5, zorder=3,
           label='Beyond a control limit')
for v, label, style in ((ucl, 'UCL', '--'), (xbb, 'CL', '-'), (lcl, 'LCL', '--')):
    a1.axhline(v, color=MUTED, linewidth=1, linestyle=style)
    a1.text(31, v, f'{label} {v:.3f}', va='center', fontsize=9, color=MUTED)
a1.set_ylabel('Subgroup mean (mm)'); a1.legend(frameon=False, loc='lower left', fontsize=9)
a2.plot(idx, spc['range'], color=BLUE, linewidth=1.6, marker='o', markersize=4.5)
for v, label, style in ((D4 * rbar, 'UCL', '--'), (rbar, 'R̄', '-')):
    a2.axhline(v, color=MUTED, linewidth=1, linestyle=style)
    a2.text(31, v, f'{label} {v:.3f}', va='center', fontsize=9, color=MUTED)
a2.set_ylabel('Range (mm)'); a2.set_xlabel('Subgroup (one per shift, n = 5)')
a2.set_xlim(0, 30.6)
save(fig, 'cs1-xbar-r.svg')


def capability(df):
    # Cp/Cpk from within-subgroup sigma (R-bar / d2), Ppk from overall sigma.
    sigma_w = df['range'].mean() / d2
    values = df[X].to_numpy().ravel()
    mu, sigma_o = values.mean(), values.std(ddof=1)
    return {'mean': mu, 'sigma_within': sigma_w, 'sigma_overall': sigma_o, 'cp': (USL - LSL) / (6 * sigma_w),
            'cpk': min(USL - mu, mu - LSL) / (3 * sigma_w), 'ppk': min(USL - mu, mu - LSL) / (3 * sigma_o)}


R['capability'] = {
    f'{phase}_{scope}': capability(subgroups[(subgroups.phase == phase) & (subgroups.machine.isin(machines))])
    for phase in ('Baseline', 'After') for scope, machines in (('all', MACHINES), ('imm3', ['IMM-3']))
}
fig, axes = plt.subplots(1, 2, figsize=(7.2, 3.0), sharey=True)
bins = np.arange(2.30, 2.701, .01)
for ax, phase, color, title in zip(axes, ('Baseline', 'After'), (GRAY, BLUE), ('Baseline, weeks 1–8', 'After, weeks 11–14')):
    vals = subgroups[subgroups.phase == phase][X].to_numpy().ravel()
    ax.hist(vals, bins=bins, weights=np.full(len(vals), 100 / len(vals)), color=color, edgecolor='white', linewidth=1)
    for v in (LSL, USL):
        ax.axvline(v, color=COPPER, linewidth=1.4, linestyle='--')
    cap = R['capability'][f'{phase}_all']
    ax.set_title(f'{title}   Ppk {cap["ppk"]:.2f}', fontsize=10.5, color=INK, loc='left')
    ax.set_xlabel('Flange thickness (mm)'); ax.set_xlim(2.32, 2.68)
axes[0].set_ylabel('Share of parts'); axes[0].yaxis.set_major_formatter(lambda v, _: f'{v:.0f}%')
for ax in axes:
    top = ax.get_ylim()[1]
    ax.text(LSL, top * .97, ' LSL', color=COPPER, fontsize=9, va='top')
    ax.text(USL, top * .97, 'USL ', color=COPPER, fontsize=9, va='top', ha='right')
save(fig, 'cs1-capability.svg')

# Regression: what drives lot-mean thickness? (baseline lots)
reg = base.merge(subgroups[['date', 'machine', 'shift', 'xbar']], on=['date', 'machine', 'shift'])
model = smf.ols('xbar ~ hold_pressure_bar + mold_temp_c + melt_temp_c + cooling_time_s', data=reg).fit()
R['regression'] = {'r2': model.rsquared, 'adj_r2': model.rsquared_adj, 'n': int(model.nobs),
                   'terms': {k: {'coef': model.params[k], 'p': model.pvalues[k]} for k in model.params.index}}
imm3 = base[base.machine == 'IMM-3']
R['settings'] = {
    'imm3_hold_mean_base': imm3.hold_pressure_bar.mean(), 'imm3_hold_sd_base': imm3.hold_pressure_bar.std(),
    'other_hold_sd_base': base[base.machine != 'IMM-3'].hold_pressure_bar.std(),
    'mold_c_shift_base': base[base['shift'] == 'C'].mold_temp_c.mean(),
    'mold_ab_shift_base': base[base['shift'] != 'C'].mold_temp_c.mean(),
    'hold_sd_after': after.hold_pressure_bar.std(), 'mold_sd_after': after.mold_temp_c.std(),
    'short_shot_moisture_corr': base[['resin_moisture_pct', 'Short shot']].corr().iloc[0, 1],
}

# Weekly run chart, baseline vs after
weekly = lots.groupby('week').apply(reject_rate, include_groups=False) * 100
fig, ax = plt.subplots(figsize=(7.2, 3.0))
for phase, weeks in (('Baseline', BASE_WEEKS), ('After', AFTER_WEEKS)):
    w = weekly.loc[list(weeks)]
    ax.plot(w.index, w.values, color=BLUE if phase == 'After' else MUTED, linewidth=2, marker='o', markersize=6,
            markeredgecolor='white', markeredgewidth=1.5)
    mean = 100 * reject_rate(lots[lots.phase == phase])
    ax.hlines(mean, min(weeks) - .3, max(weeks) + .3, color=COPPER, linewidth=1.4, linestyle='--')
    ax.text(max(weeks) + .45, mean, f'{phase}\nmean {mean:.2f}%', ha='left', va='center', fontsize=9, color=INK)
ax.set_ylim(0, weekly.max() * 1.25)
ax.axvspan(8.5, 10.5, color=GRID, alpha=.6, linewidth=0)
ax.text(9.5, weekly.max() * .55, 'Changes\nimplemented', ha='center', fontsize=9, color=MUTED)
ax.set_xticks(range(1, 15)); ax.set_xlabel('Week'); ax.set_xlim(.5, 16.2)
ax.set_ylabel('Reject rate'); ax.yaxis.set_major_formatter(lambda v, _: f'{v:.0f}%')
save(fig, 'cs1-weekly.svg')

ANNUAL_PARTS = 1200 * len(MACHINES) * len(SHIFTS) * 300   # 3 shifts, 300 days
SCRAP_COST = 0.60                                         # assumed $ per rejected part
avoided = ANNUAL_PARTS * (reject_rate(base) - reject_rate(after))
R['impact'] = {'annual_parts': ANNUAL_PARTS, 'parts_avoided': avoided, 'cost_per_part': SCRAP_COST,
               'savings': avoided * SCRAP_COST}


# ---------------------------------------------------------------- Case study 02
LINE_OF = {'M1': 'Line 1', 'M2': 'Line 1', 'M3': 'Line 1', 'M4': 'Line 2', 'M5': 'Line 2', 'M6': 'Line 2'}
CYCLE_S = {'M1': 24, 'M2': 24, 'M3': 24, 'M4': 30, 'M5': 30, 'M6': 30}
PLANNED_MIN, TARGET_OEE = 450, .75           # 8 h shift less a 30 min break
MEAN_MIN = {'Changeover': None, 'Mold / tool repair': 50, 'Material shortage': 25,
            'Machine breakdown': 50, 'Quality hold': 30, 'Operator unavailable': 25}

dates = [pd.Timestamp('2026-06-01') + pd.Timedelta(days=w * 7 + d) for w in range(13) for d in range(6)]
dim_date = pd.DataFrame({
    'date': [d.date().isoformat() for d in dates],
    'week': [f'W{(d - dates[0]).days // 7 + 1:02d}' for d in dates],
    'month': [d.strftime('%Y-%m') for d in dates],
    'weekday': [d.strftime('%a') for d in dates],
})
dim_shift = pd.DataFrame({'shift': SHIFTS, 'start': ['06:00', '14:00', '22:00'], 'end': ['14:00', '22:00', '06:00']})
dim_machine = pd.DataFrame({'machine': list(LINE_OF), 'line': list(LINE_OF.values()), 'plant': 'Plant 1',
                            'ideal_cycle_s': [CYCLE_S[m] for m in LINE_OF]})

production, downtime = [], []
for date in dim_date.date:
    for shift in SHIFTS:
        for machine, line in LINE_OF.items():
            freq = {
                'Changeover': .85 if line == 'Line 1' else .45,
                'Mold / tool repair': .45 if machine == 'M5' else .12,
                'Material shortage': .15, 'Machine breakdown': .12,
                'Quality hold': .14 if shift == 'C' else .06,
                'Operator unavailable': .20 if shift == 'C' else .05,
            }
            lost = 0
            for reason, f in freq.items():
                mean_min = MEAN_MIN[reason] or (45 if line == 'Line 1' else 30)
                for _ in range(rng.poisson(f)):
                    minutes = int(min(round(rng.gamma(4, mean_min / 4)), PLANNED_MIN - lost))
                    if minutes <= 0:
                        continue
                    lost += minutes
                    downtime.append({'event_id': len(downtime) + 1, 'date': date, 'shift': shift, 'machine': machine,
                                     'reason': reason, 'type': 'Planned' if reason == 'Changeover' else 'Unplanned',
                                     'minutes': minutes})
            run = PLANNED_MIN - lost
            perf = np.clip(rng.normal(.84 if shift == 'C' else .89, .025), .6, .99)
            total = int(run * 60 / CYCLE_S[machine] * perf)
            scrap_p = (.022 if shift == 'C' else .014) + (.006 if machine == 'M5' else 0)
            scrap = int(rng.binomial(total, scrap_p))
            rework = int(rng.binomial(total, .007))
            production.append({'date': date, 'shift': shift, 'machine': machine, 'planned_min': PLANNED_MIN,
                               'downtime_min': lost, 'run_min': run, 'total_count': total,
                               'good_count': total - scrap - rework, 'scrap_count': scrap, 'rework_count': rework,
                               'target_good': int(PLANNED_MIN * 60 / CYCLE_S[machine] * TARGET_OEE)})
production, downtime = pd.DataFrame(production), pd.DataFrame(downtime)
out_dir = DATA / 'oee-powerbi'
for name, df in (('dim_date', dim_date), ('dim_shift', dim_shift), ('dim_machine', dim_machine),
                 ('fact_production', production), ('fact_downtime', downtime)):
    df.to_csv(out_dir / f'{name}.csv', index=False)


def oee(df):
    ideal_min = (df.total_count * df.machine.map(CYCLE_S) / 60).sum()
    a = df.run_min.sum() / df.planned_min.sum()
    p = ideal_min / df.run_min.sum()
    q = df.good_count.sum() / df.total_count.sum()
    return {'oee': a * p * q, 'availability': a, 'performance': p, 'quality': q,
            'scrap_rate': df.scrap_count.sum() / df.total_count.sum(),
            'good': int(df.good_count.sum()), 'target': int(df.target_good.sum())}


O = results['oee']
O['plant'] = oee(production)
O['by_line'] = {k: oee(g) for k, g in production.merge(dim_machine, on='machine').groupby('line')}
O['by_machine'] = {k: oee(g) for k, g in production.groupby('machine')}
O['by_shift'] = {k: oee(g) for k, g in production.groupby('shift')}
O['downtime_by_reason'] = downtime.groupby('reason').minutes.sum().sort_values(ascending=False).to_dict()
O['downtime_line_reason'] = downtime.merge(dim_machine, on='machine').groupby(['line', 'reason']).minutes.sum().unstack(0).fillna(0).to_dict()
O['m5_tool_minutes'] = int(downtime[(downtime.machine == 'M5') & (downtime.reason == 'Mold / tool repair')].minutes.sum())
O['rows'] = {'production': len(production), 'downtime': len(downtime)}

# Same OEE in SQL (SQLite). Asserting equality proves the published query is right.
con = sqlite3.connect(':memory:')
production.to_sql('fact_production', con, index=False)
dim_machine.to_sql('dim_machine', con, index=False)
sql_rows = con.execute((ROOT / 'analysis' / 'oee_by_machine.sql').read_text()).fetchall()
assert len(sql_rows) == len(LINE_OF)
for row in sql_rows:
    assert abs(row[-1] - O['by_machine'][row[0]]['oee']) < 1e-9, row
assert downtime.minutes.sum() == production.downtime_min.sum()
assert (production.good_count + production.scrap_count + production.rework_count == production.total_count).all()

# Compact data for the web preview: weekly grain is enough for every visual.
p = production.merge(dim_date[['date', 'week']], on='date')
agg = p.groupby(['week', 'shift', 'machine'], as_index=False)[
    ['planned_min', 'run_min', 'total_count', 'good_count', 'scrap_count', 'rework_count', 'target_good']].sum()
d = (downtime.merge(dim_date[['date', 'week']], on='date')
     .groupby(['week', 'shift', 'machine', 'reason'], as_index=False).minutes.sum())
web = {
    'machines': dim_machine.to_dict('records'),
    'production': {'columns': list(agg.columns), 'rows': agg.values.tolist()},
    'downtime': {'columns': list(d.columns), 'rows': d.values.tolist()},
}
# A script (not JSON) so the preview also works when the page is opened from disk.
(ROOT / 'projects' / 'oee-data.js').write_text('window.OEE_DATA = ' + json.dumps(web, separators=(',', ':'), default=int) + ';\n')


def rounded(value):
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [rounded(v) for v in value]
    if isinstance(value, (float, np.floating)):
        return round(float(value), 5)
    if isinstance(value, np.integer):
        return int(value)
    return value


(DATA / 'results.json').write_text(json.dumps(rounded(results), indent=2))
print(json.dumps(rounded(results), indent=1))
