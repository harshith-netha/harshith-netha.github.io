-- OEE by machine from the star schema (SQLite / standard SQL).
-- OEE = Availability x Performance x Quality
--   Availability = run time / planned production time
--   Performance  = (total count x ideal cycle time) / run time
--   Quality      = good count / total count
WITH totals AS (
  SELECT
    p.machine,
    m.line,
    SUM(p.planned_min)                          AS planned_min,
    SUM(p.run_min)                              AS run_min,
    SUM(p.total_count * m.ideal_cycle_s / 60.0) AS ideal_min,
    SUM(p.total_count)                          AS total_count,
    SUM(p.good_count)                           AS good_count
  FROM fact_production AS p
  JOIN dim_machine AS m ON m.machine = p.machine
  GROUP BY p.machine, m.line
)
SELECT
  machine,
  line,
  1.0 * run_min / planned_min       AS availability,
  ideal_min / run_min               AS performance,
  1.0 * good_count / total_count    AS quality,
  (1.0 * run_min / planned_min) * (ideal_min / run_min) * (1.0 * good_count / total_count) AS oee
FROM totals
ORDER BY machine;
