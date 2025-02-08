"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser(params: Params): Promise<void> {
  const { userId, username, name, bio, image, path } = params;
  connectToDB();

 try {
  await User.findOneAndUpdate(
    { id: userId },
    {
      username: username.toLowerCase(),
      name,
      bio,
      image,
      onboarded: true
    },
    { upsert: true  }
  );
  
  if (path === '/profile/edit ') {
    revalidatePath(path);
  }
 } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
 }
}

export async function fetchUser(userId: string) {
  connectToDB();

  try {
    return  await User
      .findOne({ id: userId })
      // .populate({
      //   path: 'communities',
      //   model: Community
      // })
  }
  catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  connectToDB();

  try {
    // TODO: Populate community
    const result =  await User
      .findOne({ id: userId })
      .populate({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: 'name image id'
          }
        }
      })

    return result;
  }
  catch (error: any) {
    throw new Error(`Failed to fetch user threads: ${error.message}`);
  }
}
          
export async function fetchUsers({ 
  userId,
  search = "", 
  pageNumber = 1, 
  pageSize = 20,
  sortBy = "desc"
}: {
  userId: string, 
  search?: string, 
  pageNumber?: number, 
  pageSize?: number
  sortBy?: SortOrder
}) {
  connectToDB();

  const skipAmount = pageSize * (pageNumber - 1);

  try {
    const regex = new RegExp(search, 'i');
    
    const filter: FilterQuery<typeof User> = {
      id: { $ne: userId },
    }

    if (search.trim() !== "") {
      filter['$or'] = [
        { name: { $regex: regex } },
        { username: { $regex: regex } }
      ]
    }

    const sort = { createdAt: sortBy };

    const users = await User
      .find(filter)
      .sort(sort)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(filter);

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  }
  catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function fetchActivities(userId: string) {
  connectToDB();

  try {
    const userThreads = await Thread.find({ author: userId });

    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({ 
      _id: { $in: childThreadIds } ,
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: User,
      select: 'name image id'
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activities: ${error.message}`);    
  }
}