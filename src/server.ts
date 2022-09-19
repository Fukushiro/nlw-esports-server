import express, { response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import {
  convertHourStringToMinutes,
  convertMinutesToHourString,
} from "./utils/convert-hour-string-to-minutes";

const app = express();

app.use(express.json());
app.use(cors());
const prisma = new PrismaClient();

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          Ads: true,
        },
      },
    },
  });
  return response.json(games);
});
// create ad
app.post("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  console.log(gameId);
  console.log(request.body);

  // validacao com zod
  const ad = await prisma.ad.create({
    data: {
      gameId: gameId,
      name: request.body.name,
      yearsPlaying: request.body.yearsPlaying,
      discord: request.body.discord,
      weekDays: request.body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(request.body.hourStart),
      hourEnd: convertHourStringToMinutes(request.body.hourEnd),
      useVoiceChannel: request.body.useVoiceChannel,
    },
  });

  return response.status(201).json([]);
});
app.get("/ads", (req, res) => {
  return res.json({ a: "dasds", b: "dsadas", c: "dsadfgdsfsd", g: "ghhh" });
});

app.get("/games/:gameId/ads", async (request, res) => {
  const gameId = request.params.gameId;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId: gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHourString(ad.hourStart),
        hourEnd: convertMinutesToHourString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return res.json({ discord: ad.discord });
});

app.listen(3333);
