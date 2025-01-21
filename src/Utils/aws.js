require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Loaded from .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Loaded from .env
  region: process.env.AWS_REGION, // Loaded from .env
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Functions remain the same...
const addUserToDB = async ({ id, username, room }) => {
  const params = {
    TableName: "Users",
    Item: { id, username, room },
  };
  try {
    await docClient.put(params).promise();
    return { user: { id, username, room } };
  } catch (error) {
    return { error: `Error adding user: ${error.message}` };
  }
};

const removeUserFromDB = async (id) => {
  const params = {
    TableName: "Users",
    Key: { id },
  };
  try {
    const result = await docClient.get(params).promise();
    if (!result.Item) return { error: "User not found" };
    await docClient.delete(params).promise();
    return { user: result.Item };
  } catch (error) {
    return { error: `Error removing user: ${error.message}` };
  }
};

const getUserFromDB = async (id) => {
  const params = {
    TableName: "Users",
    Key: { id },
  };
  try {
    const result = await docClient.get(params).promise();
    if (!result.Item) return { error: "No such user exists" };
    return { user: result.Item };
  } catch (error) {
    return { error: `Error fetching user: ${error.message}` };
  }
};

const getUsersInRoomFromDB = async (room) => {
  const params = {
    TableName: "Users",
    IndexName: "RoomIndex", // Assuming a GSI for room-based queries
    KeyConditionExpression: "room = :room",
    ExpressionAttributeValues: {
      ":room": room,
    },
  };
  try {
    const result = await docClient.query(params).promise();
    if (result.Items.length === 0) return { error: "No users found in room" };
    return result.Items;
  } catch (error) {
    return { error: `Error fetching users in room: ${error.message}` };
  }
};

module.exports = {
  addUserToDB,
  removeUserFromDB,
  getUserFromDB,
  getUsersInRoomFromDB,
};
