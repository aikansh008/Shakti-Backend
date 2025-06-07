function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predicthealthBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'Salaries': currentProfit * 0.30,
    'Maintenance': currentProfit * 0.05,
    'Marketing': currentProfit * 0.20,
    'Investment': currentProfit * 0.10,
    'Miscellaneous': currentProfit * 0.05,
    'Consumables': currentProfit * 0.20,
  };

  const remaining = currentProfit * 0.10;

  if (trend === 'increasing') {
    budget['Salaries'] += remaining * 0.1;
    budget['Maintenance'] += remaining * 0.1;
    budget['Consumables'] += remaining * 0.2;
    budget['Investment'] += remaining * 0.3;
    budget['Marketing'] += remaining * 0.10;
    budget['Miscellaneous'] += remaining * 0.2;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into Maintenance,consumables Investment and Marketing.';
  } else if (trend === 'decreasing') {
    budget['Investment'] += remaining;
    budget['Suggestion'] = 'Profits are falling. Reinvest remaining into investment.';
  } else {
    budget['Salaries'] += remaining * 0.30;
    budget['consumables'] += remaining * 0.10;
    budget['Marketing'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.55;
    budget['Suggestion'] = 'Trend is mixed. Split remaining between Salaries,consumables , Marketing and investment.';
  }

  return budget;
}

module.exports = { predicthealthBudget };
