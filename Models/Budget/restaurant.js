function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predictrestaurantBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'COGs': currentProfit * 0.45,
    'Salaries': currentProfit * 0.20,
    'Maintenance': currentProfit * 0.05,
    'Marketing': currentProfit * 0.04,
    'Investment': currentProfit * 0.10,
    'Packaging and Transportation': currentProfit * 0.05,
    'Miscellaneous': currentProfit * 0.05,
  };

  const remaining = currentProfit * 0.06;

  if (trend === 'increasing') {
    budget['COGs'] += remaining * 0.4;
    budget['Maintenance'] += remaining * 0.2;
    budget['Investment'] += remaining * 0.2;
    budget['Marketing'] += remaining * 0.15;
    budget['Packaging and Transportation'] += remaining * 0.05;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into products ,Maintenance, Investment,Transportation and Marketing.';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['COGs'] += remaining * 0.35;
    budget['Marketing'] += remaining * 0.15;
    budget['Investment'] += remaining * 0.50;
    budget['Suggestion'] = 'Trend is mixed. Split remaining between operations and investment.';
  }

  return budget;
}

module.exports = { predictrestaurantBudget };
