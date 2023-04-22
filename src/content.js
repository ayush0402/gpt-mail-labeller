import * as InboxSDK from "@inboxsdk/core";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

const getLabelFromGPT = async (mailContent) => {
  try {
    const prompt = mailContent;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a gmail extension bot, you are supposed to read the prompt containing contents of an email and them mark it as 'academics' if they contain college lecture or assignment content, 'hackathon' if they contain hackathon or coding contest related content, 'interview' if they contain a scheduled interview or online assessment for recruitment, 'meeting' if they contain details about a scheduled meeting and 'job-opening' if they contain anything related to job or internship openings and 'none' if it is none of mentioned categories.",
        },
        { role: "user", content: `${prompt}` },
        {
          role: "assistant",
          content:
            "Give the response in one word only based on the category of the email",
        },
      ],
      max_tokens: 300,
      temperature: 0,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["\n"],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    throw error.response
      ? error.response.data
      : "There was an issue on the server";
  }
};

let originalThreadStore = [];
let threadStore = [];

const runContentScript = (inputMessage) => {
  let filter = inputMessage.selectedFilter;

  alert(filter);
  InboxSDK.load(2, "sdk_gmailgpt_00b7bc5282").then(async (sdk) => {
    sdk.Lists.registerThreadRowViewHandler(async function (threadRowView) {
      var threadView = threadRowView.getElement();
      let mailContent = threadView.innerText;

      let label = await getLabelFromGPT(mailContent);

      originalThreadStore.push([threadView, label]);
      threadStore.push([threadView, label]);
      if (filter !== "all" && label !== filter) {
        threadView.outerHTML = "";
      } else if (label !== "none") {
        let labelColor, textColor;
        if (label === "interview") (labelColor = "red"), (textColor = "white");
        else if (label === "job-opening")
          (labelColor = "orange"), (textColor = "black");
        else if (label === "meeting")
          (labelColor = "yellow"), (textColor = "black");
        else if (label === "academics")
          (labelColor = "black"), (textColor = "white");
        else if (label === "hackathon")
          (labelColor = "blue"), (textColor = "white");

        threadRowView.addLabel({
          title: label,
          iconUrl:
            "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365",
          backgroundColor: labelColor,
          foregroundColor: textColor,
        });
      }
    });
    // iterate map with filter and set Element to empty for non required labels
    for (let i = 0; i < threadStore.length; i++) {
      if (filter !== "all" && threadStore[i][1] !== filter) {
        threadStore[i][0].outerHTML = "";
      }
    }
  });
};

chrome.runtime.onMessage.addListener(runContentScript);
