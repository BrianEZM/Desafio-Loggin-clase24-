import { normalize, denormalize, schema } from "normalizr";
import util from "util";
import fs from "fs";

const author = new schema.Entity("author");

const messages = new schema.Entity("messages",{
    author: author
})

const chatSchema = new schema.Entity("chat",{
    messages: messages
})

const chatter = JSON.parse(fs.readFileSync("./src/DB/ecommerce.json"))

const normalizrMessages = () => {
	console.log("<---------- Objeto Original Length ---------->");
	console.log(JSON.stringify(chatter).length);

	console.log("<---------- Objeto Normalizado ---------->");
	const normalizedData = normalize(chatter, chatSchema);
	console.log(util.inspect(normalizedData, false, 14, true));
	console.log(JSON.stringify(normalizedData).length);

	console.log("<---------- Objeto Denormalizado ---------->");
	const denormalizedData = denormalize(normalizedData.result, chatSchema, normalizedData.entities);
	const logear = JSON.stringify(denormalizedData);
    console.log(logear.length);
};

const prueba = () => {
    return normalizrMessages();
}

export default prueba;