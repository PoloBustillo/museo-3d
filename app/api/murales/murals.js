// app/api/murales/murales.js
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const murals = await prisma.mural.findMany();
    return Response.json(murals);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error fetching murals' }, { status: 500 });
  }
}