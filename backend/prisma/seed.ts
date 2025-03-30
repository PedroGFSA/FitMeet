
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o processo de seed...`);

  const defaultImage = `${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/default-image.jpg`
  const defaultAvatar = `${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/default-avatar.jpg`

  const typeEsportes = await prisma.activityTypes.create({
    data: {
      name: 'Esportes',
      description: 'Participar de esportes.',
      image: defaultImage,
    }
  });

  const typeGamming = await prisma.activityTypes.create({
    data: {
      name: "Gamming",
      description: "Jogar jogos eletrônicos",
      image: defaultImage,
    }
  });

  const typeEventos = await prisma.activityTypes.create({
    data: {
      name: "Eventos",
      description: "Participar de eventos colaborativos",
      image: defaultImage,
    }
  });

  console.log(`Tipos de Atividade criados: ${typeEsportes.name}, ${typeGamming.name}, ${typeEventos.name}`);

  // --- Criar Conquistas (Achievements) ---
   const achievementParticiparPrimeiraAtividade = await prisma.achievements.create({
    data: {
      name: "Pioneiro",
      criterion: "Confirme sua presença em uma atividade pela primeira vez."
    }
  });

   const achievementCriarPrimeiraAtividade = await prisma.achievements.create({
    data: {
      name: "Criador iniciante",
      criterion: "Crie sua primeira ativiade."
    }});

   const achievementConcluirPrimeiraAtividade= await prisma.achievements.create({
    data: {
      name: "Ambicioso",
      criterion: "Conclua sua primeira ativiade."
    }});

   const achievementLevel5= await prisma.achievements.create({
    data: {
      name: "Explorador",
      criterion: "Atinja o level 5."
    }
  });

   
  console.log(`Achievements criados: ${achievementConcluirPrimeiraAtividade.name}, ${achievementCriarPrimeiraAtividade.name}, 
    ${achievementParticiparPrimeiraAtividade.name}, ${achievementLevel5.name}`);


  // --- Criar Users ---
  const hashedPassword = await bcrypt.hash('password', 10);

  const userAna = await prisma.users.upsert({
    where: { email: 'ana@gmail.com' },
    update: {},
    create: {
      name: 'Ana Silva',
      email: 'ana@gmail.com',
      cpf: '11111111111', 
      password: hashedPassword, 
      avatar: defaultAvatar,
      preferences: { 
        create: [
          { typeId: typeEsportes.id }, 
          { typeId: typeGamming.id },
        ]
      }
    },
    include: {
        preferences: true,
    }
  });

  const userJoao = await prisma.users.upsert({
    where: { email: 'joao@gmail.com' },
    update: {},
    create: {
      name: 'João Souza',
      email: 'joao@gmail.com',
      cpf: '22222222222',
      avatar: defaultAvatar, 
      password: hashedPassword, 
    },
  });

  console.log(`Usuários criados: ${userAna.name}, ${userJoao.name}`);
  console.log(`Preferências da Ana:`, userAna.preferences);


  // --- Criar Atividades (Activities) ---
  const activityCorrida = await prisma.activities.create({
    data: {
      title: 'Corrida',
      description: 'Corrida leve de 5km.',
      confirmationCode: '123',
      image: defaultImage,
      scheduledDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), 
      private: false,
      creator: { 
        connect: { id: userAna.id },
      },
      type: { 
        connect: { id: typeEsportes.id },
      },
      address: {
        create: {
            latitude: -10.9111, 
            longitude: -37.0711,
        }
      }
    },
    include: { 
        creator: true,
        type: true,
        address: true,
    }
  });

  console.log(`Atividade criada: ${activityCorrida.title}`);
  console.log(`Endereço da Atividade: Latitude: ${activityCorrida.address?.latitude}, Longitude: ${activityCorrida.address?.longitude}`);


  // --- Criar Participantes (ActivityParticipants) ---
  const participantJoao = await prisma.activityParticipants.create({
    data: {
        activity: { connect: { id: activityCorrida.id } },
        user: { connect: { id: userJoao.id } },
        approved: true, 
        confirmedAt: new Date(),
    }
  });

  console.log(`Participante adicionado: ${userJoao.name} na atividade ${activityCorrida.title}`);


  // --- Adicionar Conquista para Usuário (UserAchievements) ---
  const achievementForAna = await prisma.userAchievements.create({
    data: {
      user: { connect: { id: userAna.id } },
      achievement: { connect: { id: achievementCriarPrimeiraAtividade.id } }
    }
  });

  console.log(`Conquista "${achievementCriarPrimeiraAtividade.name}" adicionada para ${userAna.name}`);


  console.log(`Seed finalizado com sucesso!`);
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexão com o Prisma desconectada.');
  });