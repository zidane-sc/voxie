"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { connectToDB } from "../mongoose"
import User from "../models/user.model";
import path from "path";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread(params: Params): Promise<void> {
  const { text, author, communityId, path } = params;
  connectToDB();

 try {
  const createdThread = await Thread.create({
    text,
    author,
    community: null,
  });

  await User.findByIdAndUpdate(author, {
    $push: { threads: createdThread._id }
  });
  
  revalidatePath(path);
 } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
 }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  try {
    const filter = {
      parentId: { $exists: false }
    }

    const getThreadsQuery = Thread.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({ 
        path: "children", 
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image"
        }
      })

    const totalPostsCount = await Thread.countDocuments(filter);

    const threads = await getThreadsQuery.exec();

    const isNext = totalPostsCount > pageNumber * pageSize;

    return { threads, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch threads: ${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    // TODO: Populate community
    const thread = await Thread.findById(id)
      .populate({ 
        path: "author", 
        model: User,
        select: "_id id name image" 
      })
      .populate({
        path: 'children',
        model: Thread,
        populate: [
          {
            path: 'author',
            model: User,
            select: "_id id name parentId image"
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

      return thread;
    } catch (error: any) {
      throw new Error(`Failed to fetch thread: ${error.message}`);
    }
}

export async function addCommentToThread(
  threadId: string,
  text: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to adding comment to thread: ${error.message}`);
  }
}