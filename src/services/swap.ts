import { API } from "@/utils/api";

const processs = async (targetUrl: string, inputUrl: string) => {
  try {
    let taskId = "";
    const response = await fetch(API.FACESWAP.CREATE_TASK, {
      method: "POST",
      body: JSON.stringify({ targetUrl, inputUrl }),
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    if (data) {
      taskId = data.taskId;
    }
    return taskId;
  } catch (error: any) {
    console.error("========= Error Swap Image 1: ", error);
    return false;
  }
};


const getResult = async (taskId: string) => {
  try {
    let outputUrl = "";
    const response = await fetch(API.FACESWAP.GET_TASK, {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    if (data) {
      outputUrl = data.outputUrl;
    }
    return outputUrl;
  } catch (error: any) {
    console.error("========= Error Swap Image 2: ", error);
    return false;
  }
};

export const SwapService = {
  processs,
  getResult,
};
