// cleanup-duplicates.ts
import { PrismaClient, SensorData } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('Starting cleanup process...');
    
    // 1. Получаем все записи, сортированные по времени
    const allRecords = await prisma.sensorData.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Total records before cleanup: ${allRecords.length}`);

    // 2. Группируем записи по минутам и находим дубликаты
    const recordsByMinute = new Map<number, SensorData>();
    const duplicateIds: number[] = [];  // Явно указываем тип массива

    allRecords.forEach(record => {
      // Округляем время до минут
      const minuteKey = new Date(record.createdAt).setSeconds(0, 0);
      
      if (!recordsByMinute.has(minuteKey)) {
        // Сохраняем первую запись для этой минуты
        recordsByMinute.set(minuteKey, record);
      } else {
        // Добавляем все последующие записи в список на удаление
        duplicateIds.push(record.id);
      }
    });

    console.log(`Found ${duplicateIds.length} duplicate records`);

    if (duplicateIds.length > 0) {
      // 3. Удаляем дубликаты
      const deleteResult = await prisma.sensorData.deleteMany({
        where: {
          id: {
            in: duplicateIds
          }
        }
      });

      console.log(`Deleted ${deleteResult.count} duplicate records`);
      
      // 4. Проверяем результат
      const remainingCount = await prisma.sensorData.count();
      console.log(`Remaining records: ${remainingCount}`);
      console.log(`Unique timestamps: ${recordsByMinute.size}`);
      
      if (remainingCount === recordsByMinute.size) {
        console.log('Cleanup completed successfully!');
      } else {
        console.log('Warning: Final count doesn\'t match expected count');
      }
    } else {
      console.log('No duplicates found, database is clean');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем очистку
cleanupDuplicates()
  .then(() => console.log('Cleanup script finished'))
  .catch(console.error);