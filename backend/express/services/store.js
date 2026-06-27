// Shared in-memory data store for the Express service

const students = [
  { id: 1, name: "Aarav Patel", class: "10-A", college: "BRECW", riskLevel: "low" },
  { id: 2, name: "Diya Sharma", class: "10-A", college: "BRECW", riskLevel: "medium" },
  { id: 3, name: "Rohan Verma", class: "10-B", college: "BRECW", riskLevel: "high" },
  { id: 4, name: "Meera Nair", class: "9-C", college: "BRECW", riskLevel: "low" },

  { id: 5, name: "Ananya Reddy", class: "10-B", college: "Anurag University", riskLevel: "low" },
  { id: 6, name: "Kiran Kumar", class: "10-C", college: "Anurag University", riskLevel: "medium" },
  { id: 7, name: "Priya Menon", class: "9-A", college: "Anurag University", riskLevel: "low" },
  { id: 8, name: "Siddharth Rao", class: "9-B", college: "Anurag University", riskLevel: "medium" },

  { id: 9, name: "Ishita Gupta", class: "11-A", college: "BVRIT", riskLevel: "low" },
  { id: 10, name: "Vikram Singh", class: "11-A", college: "BVRIT", riskLevel: "high" },
  { id: 11, name: "Nisha Iyer", class: "11-B", college: "BVRIT", riskLevel: "medium" },
  { id: 12, name: "Rahul Das", class: "11-C", college: "BVRIT", riskLevel: "low" },

  { id: 13, name: "Kavya Jain", class: "12-A", college: "MREM", riskLevel: "medium" },
  { id: 14, name: "Aditya Kulkarni", class: "12-A", college: "MREM", riskLevel: "high" },
  { id: 15, name: "Pooja Desai", class: "12-B", college: "MREM", riskLevel: "low" },
  { id: 16, name: "Arjun Nair", class: "12-B", college: "MREM", riskLevel: "medium" },

  { id: 17, name: "Sneha Verma", class: "9-C", college: "JNTUH", riskLevel: "low" },
  { id: 18, name: "Yashwanth R", class: "10-C", college: "JNTUH", riskLevel: "medium" },
  { id: 19, name: "Madhuri P", class: "10-A", college: "JNTUH", riskLevel: "low" },
  { id: 20, name: "Tanvi S", class: "11-B", college: "JNTUH", riskLevel: "high" },

  { id: 21, name: "Harsha Vardhan", class: "11-C", college: "CBIT", riskLevel: "medium" },
  { id: 22, name: "Lavanya K", class: "12-C", college: "CBIT", riskLevel: "low" },
  { id: 23, name: "Ritesh Chawla", class: "12-C", college: "CBIT", riskLevel: "medium" },
  { id: 24, name: "Meghana S", class: "9-A", college: "CBIT", riskLevel: "low" },

  { id: 25, name: "Sagarika T", class: "9-B", college: "VNRVJIET", riskLevel: "high" },
  { id: 26, name: "Naveen A", class: "10-B", college: "VNRVJIET", riskLevel: "medium" },
  { id: 27, name: "Deepika R", class: "10-C", college: "VNRVJIET", riskLevel: "low" },
  { id: 28, name: "Bhavya M", class: "11-A", college: "VNRVJIET", riskLevel: "medium" },
  { id: 29, name: "Rohan K", class: "12-A", college: "VNRVJIET", riskLevel: "high" },
  { id: 30, name: "Keerthi L", class: "12-B", college: "VNRVJIET", riskLevel: "low" }
];

let latestSensorData = null;
const alertHistory = [];
const parentTelegramByStudentId = {};

module.exports = {
  students,
  getLatestSensorData: () => latestSensorData,
  setLatestSensorData: (data) => { latestSensorData = data; },
  alertHistory,
  parentTelegramByStudentId
};
