function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predictretailBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'COGs': currentProfit * 0.60,
    'Marketing': currentProfit * 0.03,
    'Salaries': currentProfit * 0.15,
    'Transportation': currentProfit * 0.05,
    'Investment': currentProfit * 0.10,
    'Miscellaneous': currentProfit * 0.03,
  };

  const remaining = currentProfit * 0.12;

  if (trend === 'increasing') {
    budget['COGs'] += remaining * 0.60;
    budget['Transportation'] += remaining * 0.05;
    budget['Marketing'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.3;
    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into products and transport.';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['COGs'] += remaining * 0.35;
    budget['Transportation'] += remaining * 0.15;
    budget['Investment'] += remaining * 0.50;
    budget['Suggestion'] = 'Trend is mixed. Split remaining between operations and investment.';
  }

  return budget;
}

module.exports = { predictretailBudget };
