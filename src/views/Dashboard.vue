<template>
	<div class="dashboard">
		<h1>Dashboard</h1>
		<div class="dashboard-datetime">Date: {{ dashboard_date }}</div>
		<div class="dashboard-datetime">Time: {{ dashboard_time }}</div>
		<div class="dashboard-datetime">(Reload every 5 min)</div>
		<div class="dashboard-data">
			<div v-if="dashboard_stat_done">
				{{ dashboard_stat }} / {{ dashboard_budget }}
			</div>
			<div v-else>
				...
			</div>
		</div>
		<div class="dashboard-refresh">
			<button class="setting_button" @click="updateStat()">
				Refresh
			</button>
		</div>
	</div>
</template>

<script>
var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function zeroPadding(num, digit) {
	var zero = '';
	for (var i = 0; i < digit; i++) {
		zero += '0';
	}
	return (zero + num).slice(-digit);
}

function getFirstDayOfMonth(date) {
	var result = new Date(date);
	result.setDate(1);
	return result;
}

function getLastDayOfMonth(date) {
	var result = new Date(date);
	result.setMonth(result.getMonth() + 1);
	result.setDate(0);
	return result;
}

function getDateDistance(date1, date2) {
	var result = 0;
	var d1 = new Date(date1);
	var d2 = new Date(date2);
	result = Math.abs(d1.getTime() - d2.getTime());
	return result;
}

function compareDates(date1, date2) {
	var result = 0;
	var d1 = new Date(date1);
	var d2 = new Date(date2);
	result = d1.getTime() - d2.getTime();
	if (result > 0) {
		return 1;
	} else if (result < 0) {
		return -1;
	} else {
		return 0;
	}
}

async function queryBilling(start_date, end_date, openai_api) {
	const start_date_str = zeroPadding(start_date.getFullYear(), 4) + '-' + zeroPadding(start_date.getMonth() + 1, 2) + '-' + zeroPadding(start_date.getDate(), 2);
	const end_date_str = zeroPadding(end_date.getFullYear(), 4) + '-' + zeroPadding(end_date.getMonth() + 1, 2) + '-' + zeroPadding(end_date.getDate(), 2);
	const api_url = "https://api.openai.com/dashboard/billing/usage?" + "end_date=" + end_date_str + "&" + "start_date=" + start_date_str;

	const result = await fetch(api_url, {
		"method": "GET",
		"headers": {
			"authorization": "Bearer " + openai_api,
		},
		"body": null
	}).then(response =>
		response.json().then(data => ({
			data: data,
			status: response.status
		})
		).then(res => ({
			status: res.status,
			usage: res.data["total_usage"]
		}))
	);
	if (result.status !== 200) {
		return -1;
	} else {
		return result.usage;
	}
}

async function queryTotal(start_date, openai_api) {
	var end_date = new Date();
	if (getDateDistance(start_date, end_date) < 100) {
		const sum = await queryBilling(start_date, end_date, openai_api);
		return sum;
	}
	var date = new Date(start_date);
	date.setMonth(date.getMonth() + 1);
	date.setDate(1);
	// Get the first month
	var sum = 0;
	const data = await queryBilling(start_date, date, openai_api);
	sum = sum + data;
	
	while (compareDates(date, end_date) < 0) {
		var loop_st_date = new Date(date);
		date.setMonth(date.getMonth() + 1);
		var loop_end_date;
		if (compareDates(date, end_date) < 0) {
			loop_end_date = date;
		} else {
			loop_end_date = end_date;
		}
		const data = await queryBilling(loop_st_date, loop_end_date, openai_api);
		// console.log("querying range: ")
		// console.log(loop_st_date)
		// console.log(loop_end_date)
		// console.log("value: ", data)
		if (data == -1) {
			return -1;
		}
		sum = sum + data;
	}
	return Math.round(sum) / 100.0;
}

export default {
	data() {
		return {
			dashboard_date: null,
			dashboard_time: null,
			dashboard_budget: "...",
			dashboard_stat: "...",
			dashboard_stat_done: false,
			openai_api: null
		}
	},
	mounted() {
		this.updateStat();
		setInterval(() => {
			this.updateTime();
		}, 1000);
		setInterval(() => {
			this.updateStat();
		}, 1000 * 300);
	},
	methods: {
		updateTime() {
			var cd = new Date();
			this.dashboard_time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2);
			this.dashboard_date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
		},
		async updateStat() {
			this.dashboard_stat_done = false;
			const savedSettings = localStorage.getItem("settings")
			if (savedSettings) {
				const formData = JSON.parse(savedSettings);
				const budget = formData.dashboard_budget;
				this.openai_api = formData.openai_api;
				console.log(this.openai_api);
				const start_date = new Date(formData.dashboard_start_date);
				this.dashboard_stat = await queryTotal(start_date, this.openai_api);
				// cannot get statistic data
				if (this.dashboard_stat == -1) {
					this.dashboard_stat = "ERR";
				} else {
					this.dashboard_stat_done = true;
				}
				// cannot get correct budget
				if (budget == 0) {
					this.dashboard_budget = "∞";
				} else {
					this.dashboard_budget = budget.toString();
				}
			} else {
				this.dashboard_stat = "ERR(Please Updaet Settings)";
			}
		}
	}
}
</script>

<style scoped>
.dashboard {
	position: fixed;
	width: 80%;
	left: 20%;
	top: 5%;
}

.dashboard-datetime {
	margin: 20px;
	font-size: medium;
}

.dashboard-data {
	font-size: xxx-large;
	font-weight: 500;
	margin: 20px;
	position: fixed;
	text-align: center;
}

.dashboard-refresh {
	margin: 100px 20px;
}

.setting_button {
	margin-top: 15px;
	font-size: small;
	border: 0;
	text-align: center;
	font-weight: 700;

	appearance: none;
	background-color: transparent;
	border: 2px solid #1A1A1A;
	border-radius: 15px;
	box-sizing: border-box;
	color: #3B3B3B;
	cursor: pointer;
	display: inline-block;

	margin: 0;
	min-height: 30px;
	min-width: 0;
	outline: none;
	margin: 30px 0px;
	padding: 0px 24px;
	text-align: center;
	text-decoration: none;
	transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
	user-select: none;
	-webkit-user-select: none;
	touch-action: manipulation;
}


.setting_button:disabled {
	pointer-events: none;
}

.setting_button:hover {
	color: #fff;
	background-color: #1A1A1A;
	box-shadow: rgba(0, 0, 0, 0.25) 0 8px 15px;
	transform: translateY(-2px);
}

.setting_button:active {
	box-shadow: none;
	transform: translateY(0);
}
</style>