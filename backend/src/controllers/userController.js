import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js"

export const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    const recommendedUsers = await User.find({
      _id: {
        $ne: userId, //exclude the current
        $nin: user.friends, // exclude users who are already friends
      },
      isOnboarded: true, // only include users who have completed onboarding
    }).select("-password");
    if (recommendedUsers.length === 0) {
      return res.status(404).json({ message: "No recommended users found" });
    }
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "fullName image language location skill");
      res.json(user.friends)
  } catch (error) {
    console.error("Error in getMyFriends controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const sendFriendRequest = async (req,res) => {
  try {
    const myId = req.user._id;
    const {id: recipientId} = req.params;
    // Prevent sending friend request to oneself
    if (myId.toString() === recipientId) {
      return res.status(400).json({message: "You cannot send a friend request to yourself"});
    }

    // Check if the recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({message: "Recipient user not found"});
    }

    // Check if they are already friends
    if (recipient.friends.includes(myId)) {
      return res.status(404).json({message: "You are already friends with this user"});
    }

    // Check if a friend request has already existed
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {sender: myId, recipient: recipientId},
        {sender: recipientId, recipient: myId},
      ]
    });
    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists between you and this user"});
    }

    // Create a new friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId
    });
    
    res.status(201).json({friendRequest});
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req,res) => {
  try {
    const {id: requestId} = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found"});
    }

    // Ensure that the logged-in user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this friend request"});
    }

    // Update the friend request status to "accepted"
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the others friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient} // addToSet: add to array if not already present
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender} // addToSet: add to array if not already present
    });
    res.status(200).json({message: "Friend request accepted"});
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req,res) => {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "fullName image language location skill bio");

    const acceptRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    }).populate("recipient", "fullName image");

    res.status(200).json({ incomingRequests, acceptRequests});
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOutgoingFriendRequests = async (req,res) => {
  try {
    const outgoingRequests  = await FriendRequest.find({
      sender: req.user._id,
      status: "pending"
    }).populate("recipient","fullName image language skill");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendRequests controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

