const Task= require('../Models/Task/task');

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, startDate,endDate,priority } = req.body;

    const newTask = new Task({
      userId: req.userId,
      title,
      description,
      startDate,
      endDate,
      priority,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// Get tasks by time filter (today, upcoming, past)
exports.getTasksByCalendarDate = async (req, res) => {
  try {
    const { date } = req.query; // expected format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const tasks = await Task.find({
      userId: req.userId,
      startDate: { $lte: selectedDate },
      endDate: { $gte: selectedDate },
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks for date', error: error.message });
  }
};


