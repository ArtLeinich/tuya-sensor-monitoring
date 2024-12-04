import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { getToken, getDeviceStatus } from "@/lib/tuyaApi";
import { schedule, ScheduledTask } from "node-cron";

interface TuyaSensorStatus {
  code: string;
  value: number;
}

interface PrismaError extends Error {
  code: string;
}

function roundToMinute(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0, 0);
}

async function fetchAndSaveSensorData() {
  try {
    const token = await getToken();
    const statusData = await getDeviceStatus(token);

    const temperatureItem = statusData.find(
      (item: TuyaSensorStatus) => item.code === "va_temperature"
    );
    const humidityItem = statusData.find(
      (item: TuyaSensorStatus) => item.code === "va_humidity"
    );

    if (!temperatureItem || !humidityItem) {
      console.error("Temperature or humidity data not found");
      return;
    }

    const temperature = temperatureItem.value / 10;
    const humidity = humidityItem.value;
    const currentTimestamp = roundToMinute(new Date());

    try {
      await prisma.sensorData.create({
        data: {
          temperature,
          humidity,
          createdAt: currentTimestamp,
        },
      });

      console.log("Sensor data saved successfully");
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        // Duplicate entry
        console.log("Duplicate data found. Skipping save.");
      } else {
        throw prismaError;
      }
    }
  } catch (error) {
    console.error("Error fetching and saving sensor data:", error);
  }
}

let cronJob: ScheduledTask | null = null;

if (!cronJob) {
  cronJob = schedule("*/5 * * * *", fetchAndSaveSensorData);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '120');

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const totalCount = await prisma.sensorData.count();

    const data = await prisma.sensorData.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc"
      },
    });

    return NextResponse.json({
      data,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + data.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
