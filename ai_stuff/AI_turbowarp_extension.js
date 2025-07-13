(function(Scratch) {
  'use strict';

  let groqAnswer = "";
  let chatHistory = [];

  class GroqAIExtension {
    getInfo() {
      return {
        id: 'groqAIblocks',
        name: 'Groq AI (Blocks)',
        blocks: [
          // Existing blocks (ask, ask with traits, ask brief)
          { opcode: 'askGroq', blockType: Scratch.BlockType.COMMAND, text: 'ask [TEXT] to Groq using history: [USEHISTORY]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Why is the sky blue?' }, USEHISTORY: { type: Scratch.ArgumentType.STRING, menu: 'booleanMenu' } } },
          { opcode: 'askGroqWithTraits', blockType: Scratch.BlockType.COMMAND, text: 'ask [TEXT] with traits [TRAITS] using history: [USEHISTORY]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Tell me a joke' }, TRAITS: { type: Scratch.ArgumentType.STRING, defaultValue: 'funny' }, USEHISTORY: { type: Scratch.ArgumentType.STRING, menu: 'booleanMenu' } } },
          { opcode: 'askGroqBrief', blockType: Scratch.BlockType.COMMAND, text: 'ask brief [TEXT] using history: [USEHISTORY]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Explain AI' }, USEHISTORY: { type: Scratch.ArgumentType.STRING, menu: 'booleanMenu' } } },

          // Chat output blocks
          { opcode: 'getGroqReply', blockType: Scratch.BlockType.REPORTER, text: 'Groq Answer' },
          { opcode: 'getGroqChatHistory', blockType: Scratch.BlockType.REPORTER, text: 'Groq Chat History (String)' },
          { opcode: 'getGroqChatList', blockType: Scratch.BlockType.REPORTER, text: 'Groq Chat List' },

          // New helper blocks
          { opcode: 'getChatMessage', blockType: Scratch.BlockType.REPORTER, text: 'chat message [INDEX]', arguments: { INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } } },
          { opcode: 'findChatIndex', blockType: Scratch.BlockType.REPORTER, text: 'chat log index of [TEXT]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '' } } },
          { opcode: 'clearChatLogs', blockType: Scratch.BlockType.COMMAND, text: 'clear chat logs' }
        ],
        menus: {
          booleanMenu: { acceptReporters: false, items: ['true', 'false'] }
        }
      };
    }

    async askGroq(args) {
      groqAnswer = await this._fetchGroqReply(args.TEXT, '', args.USEHISTORY === 'true');
      chatHistory.push(`You: ${args.TEXT}\nAI: ${groqAnswer}`);
    }

    async askGroqWithTraits(args) {
      const systemMsg = `You are an AI assistant. Please reply with these traits: ${args.TRAITS}`;
      groqAnswer = await this._fetchGroqReply(args.TEXT, systemMsg, args.USEHISTORY === 'true');
      chatHistory.push(`You: ${args.TEXT}\nAI: ${groqAnswer}`);
    }

    async askGroqBrief(args) {
      const systemMsg = "You are a very concise assistant. Give short, minimal answers unless asked to elaborate.";
      groqAnswer = await this._fetchGroqReply(args.TEXT, systemMsg, args.USEHISTORY === 'true');
      chatHistory.push(`You: ${args.TEXT}\nAI: ${groqAnswer}`);
    }

    getGroqReply() { return groqAnswer; }

    getGroqChatHistory() { return chatHistory.join("\n\n"); }

    getGroqChatList() { return chatHistory; }

    getChatMessage(args) {
      const i = Math.round(args.INDEX) - 1;
      return chatHistory[i] || '';
    }

    findChatIndex(args) {
      const txt = args.TEXT.toLowerCase();
      for (let i = 0; i < chatHistory.length; i++) {
        if (chatHistory[i].toLowerCase().includes(txt)) return i + 1;
      }
      return 0;
    }

    clearChatLogs() {
      chatHistory = [];
      groqAnswer = "";
    }

    async _fetchGroqReply(prompt, systemContent = "", useHistory = false) {
      try {
        const messages = [];
        if (systemContent) messages.push({ role: "system", content: systemContent });
        if (useHistory) {
          for (const entry of chatHistory) {
            const [u, a] = entry.split("\nAI: ");
            messages.push({ role: "user", content: u.replace("You: ", "") });
            messages.push({ role: "assistant", content: a });
          }
        }
        messages.push({ role: "user", content: prompt });

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer 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", // THIS IS AN API KEY. It does not hold any sensetive data and I undetstand that other people are allowed to use it.
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ model: "llama3-8b-8192", messages })
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content || "No reply";
      } catch (e) {
        return "Error: " + e.message;
      }
    }
  }

  Scratch.extensions.register(new GroqAIExtension());
})(Scratch);
