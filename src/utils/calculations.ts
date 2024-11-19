export const calculateDogMetrics = (dog: {
  weight: number;
  age: number;
  activity_level: number;
}) => {
  // Base calculations
  const baseCalories = 70 * Math.pow(dog.weight, 0.75);
  
  // Age factor
  let ageFactor = 1;
  if (dog.age < 1) {
    ageFactor = 3; // Puppies need more calories
  } else if (dog.age > 7) {
    ageFactor = 0.8; // Senior dogs need fewer calories
  }

  // Activity level factor (1-10 scale)
  const activityFactor = 0.8 + (dog.activity_level * 0.04);

  // Daily calories
  const dailyCalories = Math.round(baseCalories * ageFactor * activityFactor);

  // Protein requirements (grams per day)
  const protein = Math.round(dog.weight * 1.5);

  // Food amount (assuming average caloric density of 4 kcal/g)
  const foodAmount = Math.round(dailyCalories / 4);

  // Weekly and monthly amounts
  const weeklyAmount = foodAmount * 7;
  const monthlyAmount = foodAmount * 30;

  // Feeding schedule based on age and size
  let mealsPerDay = 2;
  if (dog.age < 1) {
    mealsPerDay = 3;
  } else if (dog.weight < 5) {
    mealsPerDay = 4;
  }

  const mealAmount = Math.round(foodAmount / mealsPerDay);
  const feedingSchedule = Array.from({ length: mealsPerDay }, (_, i) => {
    const hour = 8 + (i * (12 / mealsPerDay));
    return {
      time: `Meal ${hour.toString().padStart(2, '0')}:00`,
      amount: mealAmount
    };
  });

  return {
    dailyCalories,
    protein,
    foodAmount,
    weeklyAmount,
    monthlyAmount,
    feedingSchedule
  };
};