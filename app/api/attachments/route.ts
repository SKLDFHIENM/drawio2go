import { NextResponse } from "next/server";

function notImplemented() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Attachments API 尚未启用：当前附件由前端存储层负责管理，服务端仅负责聊天转发。",
    },
    { status: 501 },
  );
}

export async function GET() {
  return notImplemented();
}

export async function POST() {
  return notImplemented();
}

