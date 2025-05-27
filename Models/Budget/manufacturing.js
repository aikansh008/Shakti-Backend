function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predictmanufacturingBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'COGs': currentProfit * 0.40,
    'Salaries': currentProfit * 0.20,
    'Packaging': currentProfit * 0.05,
    'Utilities': currentProfit * 0.05,
    'Transportation': currentProfit * 0.08,
    'Investment': currentProfit * 0.10,
    'Miscellaneous': currentProfit * 0.10,
  };

  const remaining = currentProfit * 0.14;

  if (trend === 'increasing') {
    budget['COGs'] += remaining * 0.40;
    budget['Salaries'] += remaining * 0.20;
    budget['Packaging'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.10;
    budget['Transportation'] += remaining * 0.15;
    budget['Utilities'] += remaining * 0.10;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into products ,salries, Investment, Transporatation and Marketing. ';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['COGs'] += remaining * 0.35;
    budget['Marketing'] += remaining * 0.15;
    budget['Investment'] += remaining * 0.50;
    budget['Suggestion'] = 'Trend is mixed. Split remaining between COGs, Marketing and investment.';
  }

  return budget;
}

module.exports = { predictmanufacturingBudget };
