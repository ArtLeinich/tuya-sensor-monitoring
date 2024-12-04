import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  endOfYear
} from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'day';
  const dateParam = searchParams.get('date');
  
  const currentDate = dateParam ? new Date(dateParam) : new Date();
  
  let startDate: Date;
  let endDate: Date;
  let query;

  switch (range) {
    case 'day':
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
     
      query = prisma.$queryRaw`
        SELECT DISTINCT ON (date_trunc('hour', "createdAt"))
          id,
          temperature,
          humidity,
          "createdAt"
        FROM "SensorData"
        WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
        ORDER BY date_trunc('hour', "createdAt"), "createdAt" DESC
      `;
      break;
      
    case 'month':
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      query = prisma.sensorData.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      break;
      
    case 'year':
      startDate = startOfYear(currentDate);
      endDate = endOfYear(currentDate);
      query = prisma.sensorData.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      break;
      
    default:
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
      query = prisma.sensorData.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
  }

  const data = await query;
  return NextResponse.json(data);
}