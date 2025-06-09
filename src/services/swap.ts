const APIKEY = process.env.NEXT_PUBLIC_PIAPI_KEY;

const processs = async (targetUrl: string, inputUrl: string) => {
  try {
    let taskId = "";
    const myHeaders = new Headers();

    myHeaders.append("x-api-key", String(APIKEY));
    myHeaders.append("Content-Type", "application/json");
    const raw = {
      model: "Qubico/image-toolkit",
      task_type: "face-swap",
      input: {
        target_image: targetUrl,
        swap_image: inputUrl,
      },
    };
    const requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(raw),
      redirect: "follow",
    };
    await fetch("https://api.piapi.ai/api/v1/task", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        taskId = result.data.task_id;
      })
      .catch((error) => console.error(error));
    return taskId;
  } catch (error: any) {
    console.error("========= Error Swap Image 1: ", error);
    return false;
  }
};

const getResult = async (taskId: string) => {
  try {
    let outputUrl = "";
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", String(APIKEY));
    myHeaders.append("Content-Type", "application/json");
    const requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        outputUrl = result.data.output.image_url;
      })
      .catch((error) => console.error(error));
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
