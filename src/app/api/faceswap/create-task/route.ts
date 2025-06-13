import { API } from "@/utils/api";
import { NextRequest } from "next/server";

const APIKEY = process.env.NEXT_PUBLIC_PIAPI_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, inputUrl } = body;

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

    await fetch(API.FACESWAP.PROCESS, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        taskId = result.data.task_id;
      })
      .catch((error) => console.error(error));

    if (taskId !== "") {
      return new Response(JSON.stringify({
        success: true,
        taskId: taskId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Failed to swap face" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}