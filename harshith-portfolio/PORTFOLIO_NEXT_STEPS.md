# Portfolio: what was added, and what only you can finish

## Added to the site

| Where | What |
| --- | --- |
| `index.html` | Headline: *Manufacturing quality · Process improvement · Statistical analytics* (title, meta, hero eyebrow). Stronger Steller bullet. Projects section is now four case studies in one format. DMAIC panels link to the evidence. Expertise lists MSA, PFMEA, control plans, 8D, DAX, Python, and SQL. |
| `projects/defect-reduction.html` | Case study 01, the flagship: Gage R&R → Pareto → stratification → X̄-R → Cpk/Ppk → regression → 5 Whys → actions → before/after → control plan, PFMEA, 8D. |
| `projects/oee-dashboard.html` (+ `.js`, `oee-data.js`) | Case study 02: star schema, KPI definitions, DAX, interactive dashboard (filters, drill-down), supervisor decisions, SQL cross-check. |
| `analysis/build_case_studies.py` | Generates the data, runs every statistic, draws every chart, and checks the SQL against the model. `.venv/bin/python analysis/build_case_studies.py` |
| `analysis/oee_measures.dax`, `analysis/oee_by_machine.sql` | The Power BI measures and the same OEE in SQL |
| `data/` | All CSVs (downloadable from the pages) and `results.json` |

Case studies 01 and 02 use a **simulated** dataset, and both pages say so clearly. Never present them as employer data. In an interview, say: *"I built this to practice the full workflow end to end; the data is simulated so I could publish it."*

## Before you share the site: make sure you can defend every line

You will be asked about these. Walk through each one until you can explain it without notes:

- [ ] Why Gage R&R comes first, and what %Study Var, %Tolerance and ndc mean
- [ ] Why Cpk is 1.50 but Ppk is 0.86, and what that gap tells you
- [ ] How X̄-R limits are calculated (A2, D4, d2 for n = 5), and why the R chart can be in control while the X̄ chart is not
- [ ] What the regression coefficients and p-values mean, and why regression on observational data is not proof
- [ ] What a check ring does in an injection-molding machine
- [ ] Availability × Performance × Quality, and why you never average OEE percentages
- [ ] What `RELATED`, `SUMX`, `DIVIDE` and `REMOVEFILTERS` do in the DAX
- [ ] Rerun `analysis/build_case_studies.py` yourself, and read the code

## Build the real Power BI file (about 2 hours)

The page shows a web preview. To make the Power BI claim complete:

1. Power BI Desktop › Get data › Text/CSV › load the five files in `data/oee-powerbi/`.
2. Model view: create the six relationships listed in `oee_measures.dax` (many-to-one, single direction).
3. Create the measures from `oee_measures.dax`.
4. Build the visuals: KPI cards, weekly OEE line with a 75% constant line, downtime bar chart sorted descending, OEE by machine with a line › machine hierarchy (drill-down), and a scrap matrix (machine × shift) with conditional formatting.
5. Save as `OEE_Dashboard.pbix`, add it to `data/oee-powerbi/`, take a screenshot, and add both to the Files section of `projects/oee-dashboard.html`.

## Real numbers needed for your real projects

Send me these (or add them yourself) and case studies 03 and 04 can get full pages like 01 and 02. Until then they show only what your resume supports.

### Battery DOE (case study 04)
- [ ] Factor levels: temperature (low/high), charge time (low/high), material types (which ones)
- [ ] Number of runs and replicates; was the run order randomized?
- [ ] Charge-retention results for each run (the Minitab worksheet is ideal)
- [ ] ANOVA table: which effects and interactions were significant (p-values)
- [ ] Residual plots, if you have them (normality, constant variance)
- [ ] The best settings, and whether you ran a confirmation test

### Line balancing (case study 03)
- [ ] Task list with times (or station times) from your time study, and the number of observations
- [ ] Precedence relationships (which task must come before which)
- [ ] Demand or required output, so takt time can be calculated
- [ ] Bottleneck station and its cycle time
- [ ] Your proposed reassignment of tasks to stations
- [ ] From these, the page can show line efficiency before and after, balance delay, and throughput gain

### Steller Plastics (resume and experience section)
Add only what you can verify:
- [ ] Over what period the 8% reduction happened
- [ ] Was it 8 percentage points, or 8% relative? (For example, 5.0% → 4.6% is 8% relative.)
- [ ] Baseline and final rejection rate
- [ ] Product or process (injection molding? which part family?)
- [ ] Monthly volume, so defects avoided can be estimated

## Skills to build next, in order

1. MSA / Gage R&R and PFMEA: redo case study 01's Gage R&R in Minitab and compare the results
2. SQL: practice on the OEE CSVs (downtime by reason per week, worst machine per shift)
3. Power BI: the `.pbix` above
4. Python: pandas and statsmodels, by reading and modifying `build_case_studies.py`
5. Later: ISO 9001 fundamentals, SAP PP/MM, MES concepts. Don't list these until you have studied them.
