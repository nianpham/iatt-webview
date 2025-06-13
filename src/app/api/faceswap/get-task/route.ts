import { API } from "@/utils/api";
import { NextRequest } from "next/server";

const APIKEY = process.env.NEXT_PUBLIC_PIAPI_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    let outputUrl = "";

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", String(APIKEY));
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${API.FACESWAP.PROCESS}/${taskId}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        outputUrl = result.data.output.image_url;
      })
      .catch((error) => console.error(error));

    return new Response(JSON.stringify({ outputUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to get task" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
