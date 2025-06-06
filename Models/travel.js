function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predicttravelBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'Fuel': currentProfit * 0.45,
    'Salaries': currentProfit * 0.25,
    'Maintenance': currentProfit * 0.05,
    'Marketing': currentProfit * 0.02,
    'Investment': currentProfit * 0.10,
    'Miscellaneous': currentProfit * 0.05,
  };

  const remaining = currentProfit * 0.03;

  if (trend === 'increasing') {
    budget['Fuel'] += remaining * 0.4;
    budget['Salaries'] += remaining * 0.1;
    budget['Maintenance'] += remaining * 0.2;
    budget['Investment'] += remaining * 0.2;
    budget['Marketing'] += remaining * 0.10;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into Fuel ,Maintenance, Investment and Marketing.';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['Fuel '] += remaining * 0.40;
    budget['Marketing'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.55;
    budget['Suggestion'] = 'Trend is mixed. Split remaining between Fuel and investment.';
  }

  return budget;
}

module.exports = { predicttravelBudget };
