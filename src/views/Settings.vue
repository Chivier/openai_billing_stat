<script>
export default {
  data() {
    return {
      formData: {
        // openai api key
        openai_api: "",
        // check openai api key available
        // 0: not sure
        // 1: available
        // 2: not available
        openai_available: 0,
        // monthly hard limit
        monthly_hard_limit: 0,
        // monthly soft limit
        monthly_soft_limit: 0,
        // start date for dashboard statistics
        // default value: 2022-08-01
        dashboard_start_date: "2022-08-01",
        // total budget for openai api, default value is infinity and I use 0 for this budget (No budget)
        dashboard_budget: 0,
      }
    }
  },
  mounted() {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      this.formData = JSON.parse(savedSettings)
    }
  },
  methods: {
    async checkAPI() {
      console.log("Checking API...");
      console.log(this.formData.openai_api);
      const api_url = "https://api.openai.com/v1/models";
      const response = await fetch(api_url, {
        "method": "GET",
        "headers": {
          "authorization": "Bearer " + this.formData.openai_api,
        },
        "body": null
      });
      // console.log(response);
      if (response.ok) {
        this.formData.openai_available = 1;
      } else {
        this.formData.openai_available = 2;
      }
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        localStorage.setItem("settings", JSON.stringify(newVal))
      },
      deep: true
    }
  }

}


</script>

<template>
  <div class="settings">
    <div class="setting_require_check">
      <div class="setting">
        <label class="setting_label">OpenAI API:</label>
        <input class="setting_input" v-model="formData.openai_api" placeholder="Input OpenAI API Key">
        <button class="setting_button" @click="checkAPI">Check</button>
        <span class="dot" :style="{
          backgroundColor: formData.openai_available == 0 ? '#bbb' : (formData.openai_available == 1 ? 'green' : 'red')
        }"></span>
      </div>
    </div>

    <div class="setting">
      <label class="setting_label">Hard Limit($):</label>
      <input class="setting_input" v-model="formData.monthly_hard_limit" placeholder="0" />
    </div>

    <div class="setting">
      <label class="setting_label">Soft Limit($):</label>
      <input class="setting_input" v-model="formData.monthly_soft_limit" placeholder="0" />
    </div>

    <div class="setting">
      <label class="setting_label">Total Budget($):</label>
      <input class="setting_input" v-model="formData.dashboard_budget" placeholder="0 (No budget)" />
    </div>

    <div class="setting">
      <label class="setting_label">Dashboard Start:</label>
      <input class="setting_input" v-model="formData.dashboard_start_date" placeholder="YYYY-MM-DD" />
    </div>


  </div>
</template>

<style scoped>
@import url('https://fonts.font.im/css?family=Roboto+Mono');

.settings {
  width: 80%;
  position: fixed;
  top: 50%;
  left: 65%;
  transform: translate(-50%, -50%);
}

.dot {
  height: 20px;
  width: 20px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 10px;
  vertical-align: middle;
}

.setting_message {
  height: 70px;
  margin-left: 70px;
  text-align: left;
  font-family: 'Roboto Mono Bold', monospace;
  font-weight: 700;
  color: red;
}

.setting {
  margin-bottom: 5px;
}

.setting_require_check {
  align-items: center;
  display: flex;
}

.setting_label {
  display: inline-block;
  width: 140px;
  height: 70px;
  text-align: right;
  font-family: 'Roboto Mono Bold', monospace;
  font-size: small;
  font-weight: 700;
}

.setting_input {
  margin: 10px;
  width: 180px;
  padding: 10px;
  border-radius: 5px;

  border: 2px solid #BBB;
  border-radius: 15px;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-block;

  font-size: medium;
}

.setting_input:focus {
  border: 2px solid #66CCFF;
  border-radius: 15px;
  box-sizing: border-box;
  color: #1A1A1A;
  cursor: pointer;
  display: inline-block;
}

.setting_button {
  margin-top: 15px;
  font-family: 'Roboto Mono Bold', monospace;
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
