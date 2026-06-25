import { StreamChat } from "stream-chat"

const apiKey = process.env.STREAM_API_KET;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key and secret must be set in environment variables")
}

const stramClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await stramClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:",error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdString = userId.toString();
    return stramClient.createToken(userIdString);
  } catch (error) {
    
  }
};