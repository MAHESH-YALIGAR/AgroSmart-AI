import json
from llm import llm
from tools.chat_tools import tools
from typing import Annotated, TypedDict, List, Dict, Any, Optional
from input_types import MasterGraphState
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

# Bind defined tools to the LLM instance
llm_with_tools = llm.bind_tools(tools)


def agent_node(state: MasterGraphState):
    # 1. Safely extract parameters from the Graph State
    custom_output = state.get("custom_model_output", {}) or {}
    detected_issue = custom_output.get("detected_issue", "None")
    confidence = custom_output.get("confidence", 0.0)
    
    # Extract the active language preference passed from your frontend dropdown!
    target_language = state.get("language", "English")
    
    print("--- DEBUG: AGENT NODE STATE PROCESSING ---")
    print("Detected disease:", detected_issue)
    print("Selected system language:", target_language)
    print("------------------------------------------")
    
    image_context = ""
    if detected_issue and detected_issue != "None":
        image_context = f"""
---------------------------------------------------
🚨 CRITICAL ACTIVE CONTEXT: IMAGE ANALYSIS RESULTS
---------------------------------------------------
Our custom vision model has analyzed the farmer's uploaded image and diagnosed:
• Identified Disease/Issue: {detected_issue}
• Detection Confidence: {confidence * 100:.1f}%

CRITICAL DIRECTIVES FOR THIS CONVERSATION TURN:
1. EXPLANATION: Immediately acknowledge this diagnosis in a supportive, farmer-friendly tone. Provide a clear and comprehensive explanation of {detected_issue} (symptoms, typical causes, and biological/organic remedies).
2. AUTOMATIC TOOL TRIGGERING: Treat this disease context as active intent.
   - If the farmer's prompt indicates they want an inspection, a plant doctor, or official help -> AUTOMATICALLY trigger 'get_agriculture_experts' passing this crop/disease profile.
   - If the farmer wants to buy medicine, pesticides, chemical controls, or sprays -> AUTOMATICALLY trigger 'get_agro_store' with relevant product names (e.g., specific fungicides or treatments for {detected_issue}).
"""
    else:
        image_context = "\nNo crop image was uploaded for this turn. Answer the farmer's regular message text directly.\n"

    system_prompt_content = f"""
You are AgroSmart-AI, an expert agricultural assistant.

CRITICAL LANGUAGE REQUIREMENT:
The user has chosen to communicate in: {target_language}.
You MUST generate your final textual conversational reply entirely in {target_language}. 
Translate all disease explanations, descriptions, greetings, and advice into {target_language} so the farmer can easily read it. Keep tool call structural syntax normal, but your text reply must be written in {target_language}.

You have access to the following tools:

---------------------------------------------------
1. get_weather
---------------------------------------------------
Use this tool whenever the user asks about: Weather, Temperature, Rainfall, Humidity, Wind, Climate.
Never guess weather information. Always call the get_weather tool.

---------------------------------------------------
2. get_market_prices
---------------------------------------------------
Use this tool whenever the user asks about crop, mandi, commodity prices or rates.
Before calling get_market_prices, you MUST have State, District, Mandi, and Commodity names. If any is missing, politely ask only for that field in {target_language}.

---------------------------------------------------
3. get_agriculture_experts
---------------------------------------------------
Purpose: Finds nearby Government-registered Agriculture Experts based on the farmer's crop and location.
Rules: Automatically reuse the detected crop/disease profile ({detected_issue}) from image analysis to trigger this tool immediately if applicable without asking the user.

---------------------------------------------------
4. get_agro_store
--------------------------------===================
Use this tool if the user asks for nearby agro stores or specific items like fertilizers/pesticides to treat {detected_issue}.

---------------------------------------------------
{image_context}
---------------------------------------------------

General Behaviour
---------------------------------------------------
• Answer agriculture-related questions accurately.
• Never hallucinate tool/mandi information. Always use appropriate tools.
• Respond in a simple, gentle, and farmer-friendly manner using the language: {target_language}.
"""

    system_prompt = SystemMessage(content=system_prompt_content)

    # 4. Chain the language instructions with your message timeline
    messages = [system_prompt] + state["messages"]

    # 5. Invoke the LLM
    response = llm_with_tools.invoke(messages)

    return {"messages": [response]}



workflow = StateGraph(MasterGraphState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", tools_condition)
workflow.add_edge("tools", "agent")

memory = MemorySaver()
compiled_graph = workflow.compile(checkpointer=memory)
