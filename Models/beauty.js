function trendDirection(profits) {
  const [p1, p2, p3, p4] = profits;
  if (p1 < p2 && p2 < p3 && p3 < p4) return 'increasing';
  if (p1 > p2 && p2 > p3 && p3 > p4) return 'decreasing';
  return 'mixed';
}

function predictbeautyBudget(last4MonthProfits, currentProfit) {
  const trend = trendDirection(last4MonthProfits);

  let budget = {
    'COGs': currentProfit * 0.40,
    'Salaries': currentProfit * 0.20,
    'Maintenance': currentProfit * 0.03,
    'Marketing': currentProfit * 0.03,
    'Customer Experience': currentProfit * 0.10,
    'Investment': currentProfit * 0.10,
  };

  const remaining = currentProfit * 0.14;

  if (trend === 'increasing') {
    budget['COGs'] += remaining * 0.40;
    budget['Salaries'] += remaining * 0.20;
    budget['Maintenance'] += remaining * 0.05;
    budget['Investment'] += remaining * 0.10;
    budget['Marketing'] += remaining * 0.15;
    budget['Customer Experience'] += remaining * 0.10;

    budget['Suggestion'] = 'Profits are increasing. Reinvest remaining into products ,Maintenance, Investment, Customer Experience and Marketing. ';
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

module.exports = { predictbeautyBudget };
