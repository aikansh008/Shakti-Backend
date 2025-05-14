function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predictlaundryBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'Cleaning Supplies': currentProfit * 0.30,
    'Salaries': currentProfit * 0.25,
    'Maintenance': currentProfit * 0.05,
    'Marketing': currentProfit * 0.025,
    'Investment': currentProfit * 0.10,
    'Miscellaneous': currentProfit * 0.05,
    'Packaging and Deliveries' : currentProfit * 0.15,
  };

  const remaining = currentProfit * 0.075;

  if (trend === 'increasing') {
    budget['Cleaning Supplies'] += remaining * 0.25;
    budget['Salaries'] += remaining * 0.20;
    budget['Maintenance'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.1;
    budget['Marketing'] += remaining * 0.1;
    budget['Miscellaneous'] += remaining * 0.2;
    budget['Packaging and Deliveries'] += remaining * 0.1;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into Maintenance,consumables Investment and Marketing.';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['Salaries'] += remaining * 0.25;
    budget['Cleaning Supplies'] += remaining * 0.30;
    budget['Marketing'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.30;
     budget['Packaging and Deliveries'] += remaining * 0.1;

    budget['Suggestion'] = 'Trend is mixed. Split remaining between Salaries,consumables , Marketing and investment.';
  }

  return budget;
}

module.exports = { predictlaundryBudget };
