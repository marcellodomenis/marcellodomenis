import { promises as fs } from "node:fs";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "http://dataservice.accuweather.com";

const emojis = [
	"☀️",
	"☀️",
	"🌤",
	"🌤",
	"🌤",
	"🌥",
	"☁️",
	"☁️",
	"🌫",
	"🌧",
	"🌦",
	"🌦",
	"⛈",
	"⛈",
	"🌦",
	"🌧",
	"🌨",
	"🌨",
	"🌨",
	"❄️",
	"❄️",
	"🌧",
	"🌧",
	"🌧",
	"🌧",
	"🌫",
	"🥵",
	"🥶",
];

const dayBubbleWidths: { [key: string]: number } = {
	Monday: 235,
	Tuesday: 235,
	Wednesday: 260,
	Thursday: 245,
	Friday: 220,
	Saturday: 245,
	Sunday: 230,
};

const today = new Date();
const todayDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
	today,
);
const psTime = formatDistanceToNow(new Date(2024, 1, 1));

const locationKey = "214046";
const url = `${BASE_URL}/forecasts/v1/daily/1day/${locationKey}?apikey=${WEATHER_API_KEY}&language=en-us&details=false&metric=false`;

(async () => {
	try {
		const response = await axios.get(url);
		const { Temperature, Day } = response.data.DailyForecasts[0];
		const degF = Math.round(Temperature.Maximum.Value);
		const degC = Math.round(((degF - 32) * 5) / 9);
		const icon = Day.Icon;

		let data = await fs.readFile("src/template.svg", "utf-8");
		data = data
			.replace("{degF}", degF.toString())
			.replace("{degC}", degC.toString())
			.replace("{weatherEmoji}", emojis[icon])
			.replace("{psTime}", psTime)
			.replace("{todayDay}", todayDay)
			.replace("{dayBubbleWidth}", dayBubbleWidths[todayDay].toString());

		try {
			await fs.access("dist");
		} catch (err) {
			await fs.mkdir("dist");
		}

		await fs.writeFile("dist/chat.svg", data);
		// await fs.copyFile("src/style.css", "dist/style.css");

		console.log("success");
	} catch (error) {
		console.error("Error:", error);
	}
})();
