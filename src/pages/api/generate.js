import { getSession } from "next-auth/react";
import { Configuration, OpenAIApi } from "openai";
import Profile from "../src/models/Profile";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generator(req, res) {
  const anonymous = req.body.isAnonymous;
  const plans = req.body.plans;
  let completion;
  if (plans === "basic") {
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.input,
      max_tokens: 30,
      temperature: 1,
    });
  }

  if (plans === "intermediate") {
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.input,
      max_tokens: 3500,
      temperature: 1,
    });
  }

  try {
    const session = await getSession({ req });
    const user = await Profile.findOne({ email: session?.user?.email });
    if (user) {
      user.histories.push({
        rawText: req.body.input,
        generatedText: completion.data.choices[0].text,
        author: user.username || user.name || user.email,
        isPrivate: false,
      });
      await user.save();
    }

    if (anonymous) {
      const anonymousUser = await Profile.find({});

      if (anonymousUser.length === 0) {
        console.log("entro o no?");
        const newAnonymousUser = await Profile.create({
          username: "Anonymous",
        });
        newAnonymousUser.histories.push({
          rawText: req.body.input,
          generatedText: completion.data.choices[0].text,
          author: "Anonymous",
          isPrivate: false,
        });
        await newAnonymousUser.save();
      } else {
        anonymousUser.histories.push({
          rawText: req.body.input,
          generatedText: completion.data.choices[0].text,
          author: "Anonymous",
          isPrivate: false,
        });
        await anonymousUser.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({ result: completion.data.choices[0].text });
}

function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.
Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
