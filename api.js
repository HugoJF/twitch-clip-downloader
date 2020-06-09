const axios = require("axios");

const api = (options) => axios.request({
	baseURL: 'https://api.twitch.tv/kraken',
	headers: {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": process.env.CLIENT_ID,
		"Content-Type": "application/json",
	},
	...options,
})

module.exports = {
	clips: {
		/**
		 * @param {object} options The options for the thing
		 * @param {string} options.channel The channel the clips originate from
		 * @param {"all" | "day" | "week" | "month"} options.period The period of time to filter the clips by
		 * @param {number} options.limit The max number of clips to get
		 * @param {string} options.cursor The place to start reading clips from
		 */
		top: function(params) {
			return api({
				url: "clips/top",
				params,
			})
		}
	}
}