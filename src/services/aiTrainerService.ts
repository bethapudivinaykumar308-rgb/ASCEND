import { ChatMessage, CareerPlan, DailyLesson } from '../types';

export const aiTrainerService = {
  async respondToUser(
    userPrompt: string,
    plan: CareerPlan | null,
    history: ChatMessage[],
    activeLessonOverride?: DailyLesson | null
  ): Promise<ChatMessage> {
    const activeLesson =
      activeLessonOverride ||
      plan?.levels.find((l) => l.levelNumber === plan.currentLevelNumber)?.lessons.find((l) => l.dayNumber === plan?.currentDayNumber) ||
      plan?.levels[0]?.lessons[0];

    // Attempt intelligent server-side Gemini response
    try {
      const response = await fetch('/api/trainer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          plan,
          activeLesson,
          history: history.slice(-6),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          return {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toISOString(),
            topicRef: activeLesson?.topic,
            suggestedAction: data.suggestedAction,
          };
        }
      }
    } catch (err) {
      console.warn('[AITrainer] Remote Gemini chat error, using local expert fallback:', err);
    }

    // Heuristic fallback if remote model is unavailable
    const prompt = userPrompt.trim().toLowerCase();
    const targetJob = plan?.goal.targetJob || 'Software Engineering';
    const currentLevel = plan?.levels.find((l) => l.levelNumber === plan.currentLevelNumber) || plan?.levels[0];

    let reply = '';
    let suggestedAction = '';

    // 1. Topic Explanation
    if (
      prompt.includes('explain') ||
      prompt.includes('what is') ||
      prompt.includes('how does') ||
      prompt.includes('today') ||
      prompt.includes('topic')
    ) {
      if (activeLesson && (prompt.includes('today') || prompt.includes('topic') || prompt.includes(activeLesson.topic.toLowerCase()))) {
        reply = `### Today's Topic: ${activeLesson.topic}\n\n${activeLesson.explanation || activeLesson.shortExplanation}\n\n**Core Technical Objectives for ${targetJob}:**\n${activeLesson.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\n**Why it matters for hiring:**\n${activeLesson.whyItMatters || 'Evaluated in technical screenings to verify foundational comprehension and design patterns.'}\n\n*Would you like to analyze the daily practice task or test yourself on an interview question?*`;
        suggestedAction = "Open Today's Class";
      } else if (prompt.includes('big-o') || prompt.includes('complexity') || prompt.includes('time complexity')) {
        reply = `### Big-O Asymptotic Analysis Breakdown\n\nBig-O notation describes the limiting behavior of an algorithm as the input size $N$ tends toward infinity:\n\n- **O(1) Constant**: Hash map lookups, array index access, stack push/pop.\n- **O(log N) Logarithmic**: Binary search, balanced BST operations.\n- **O(N) Linear**: Traversing an array, linear search, copying elements.\n- **O(N log N) Linearithmic**: Merge Sort, Quick Sort (average), Timsort.\n- **O(N²) Quadratic**: Nested loops over the same collection (e.g. Bubble sort).\n\n**Interview Tip for ${targetJob}:** Always state your brute-force complexity first before optimizing to O(N) or O(N log N).`;
        suggestedAction = 'Solve in Practice Workspace';
      } else if (prompt.includes('sql') || prompt.includes('join') || prompt.includes('database')) {
        reply = `### Database & SQL Architecture Core\n\nWhen designing persistence layers for **${targetJob}**:\n\n1. **INNER JOIN**: Returns rows with matching keys in both tables.\n2. **LEFT JOIN**: Preserves all rows from left table, with NULLs for unmatched right rows.\n3. **Indexing (B-Tree)**: Essential for columns used in WHERE filters, JOIN keys, and ORDER BY clauses.\n4. **ACID Properties**: Atomicity, Consistency, Isolation, and Durability ensure transactional safety under concurrency.`;
        suggestedAction = 'Solve in Practice Workspace';
      } else if (prompt.includes('git') || prompt.includes('rebase') || prompt.includes('merge')) {
        reply = `### Git Branching Strategies: Merge vs Rebase\n\n- **git merge**: Creates a 2-parent merge commit preserving chronological topology. Safe for shared public branches.\n- **git rebase**: Reapplies your commits linearly onto the tip of the upstream branch. Keeps history clean and bisect-friendly.\n\n*Best Practice:* Rebase your local feature branches before creating Pull Requests; never rebase pushed shared branches like \`main\`.`;
      } else {
        reply = `### Concept Breakdown for ${targetJob}\n\nIn technical systems engineering, mastering foundational paradigms—clean modular separation of concerns, defensive error propagation, and efficient memory utilization—distinguishes junior developers from production-ready engineers.\n\nFor **${currentLevel?.title || 'your current level'}**, focus on:\n- Implementing idiomatic solutions without superfluous allocations.\n- Writing deterministic unit tests covering empty and boundary edge cases.\n- Explaining your architectural trade-offs with structured clarity.\n\nWhat specific concept or code snippet would you like me to analyze?`;
      }
    }
    // 2. Practice Task & Coding Checks
    else if (prompt.includes('practice') || prompt.includes('code') || prompt.includes('question') || prompt.includes('task')) {
      if (activeLesson) {
        reply = `### Practice Challenge for ${activeLesson.topic}\n\n**Challenge Brief:**\n${activeLesson.practiceTask.description}\n\n**Starter Template:**\n\`\`\`\n${activeLesson.practiceTask.starterCode}\n\`\`\`\n\n**Target Verification Output:**\n\`\`\`\n${activeLesson.practiceTask.expectedOutput}\n\`\`\`\n\n*Tip:* Implement edge case checks (empty inputs, negative bounds) before returning your final result. Paste your draft here and I'll critique it!`;
        suggestedAction = 'Solve in Practice Workspace';
      } else {
        reply = `### Algorithmic Warm-up for ${targetJob}\n\n**Problem:** Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\n- *Optimal Complexity:* O(N) time and O(N) space using a hash table.\n- *Common Mistake:* Using nested loops resulting in O(N²) quadratic latency.\n\nTry writing out your pseudo-code approach or open the Practice Workspace to code it live!`;
        suggestedAction = 'Solve in Practice Workspace';
      }
    }
    // 3. Weak Areas Diagnostics
    else if (prompt.includes('weak') || prompt.includes('mistake') || prompt.includes('fail') || prompt.includes('review')) {
      const weakAreas = plan?.analytics.weakAreas || [];
      if (weakAreas.length > 0) {
        reply = `### Identified Diagnostic Weak Areas\n\nBased on your assessment history, we detected friction in:\n${weakAreas.map((w) => `- **${w}**`).join('\n')}\n\n**Recommended 3-Step Remediation Plan:**\n1. **Review Verified Documentation:** Open the Resources tab and read the authoritative guides for these topics.\n2. **Isolate Code Corner Cases:** Re-implement the practice challenges focusing strictly on edge inputs.\n3. **Retake Assessment:** Aim for ≥ 85% on your retake to lock in retention before advancing.`;
        suggestedAction = 'Review Weak Topics';
      } else {
        reply = `### Diagnostic Status: All Clear ✓\n\nYou currently have zero recorded weak areas on your track. You are maintaining strong retention across your level assessments.\n\nContinue completing your daily lessons and maintaining your practice cadence to keep this baseline!`;
        suggestedAction = "Open Today's Class";
      }
    }
    // 4. Job Readiness & Interviews
    else if (prompt.includes('interview') || prompt.includes('ready') || prompt.includes('job') || prompt.includes('hire') || prompt.includes('mock')) {
      const passedCount = plan?.levels.filter((l) => l.status === 'completed').length || 0;
      const totalCount = plan?.levels.length || 6;
      reply = `### Job Readiness Audit for ${targetJob}\n\n- **Stage-Gated Levels Passed:** ${passedCount} of ${totalCount}\n- **Assessment Score Mean:** ${plan?.analytics.averageScorePercent || 0}%\n- **Capstone Status:** ${passedCount >= totalCount ? 'Eligible for Final Defense' : 'Milestones in progress'}\n\n**Technical Screening Simulation Question:**\n> *"Describe how you would design a resilient, high-throughput service handling peak traffic surges. What caching, database replication, and rate-limiting trade-offs would you implement?"*\n\nTake a moment to draft your answer using the STAR structure, and I will score your response against engineering hiring rubrics!`;
      suggestedAction = 'View Job Readiness';
    }
    // 5. General Fallback
    else {
      reply = `### ASCEND Career Trainer · ${targetJob}\n\nI am tracking your progress in **${currentLevel?.title || 'Level 1'}**.\n\nHere is how I can assist your daily training:\n- **Conceptual Explanations:** Deep-dives into algorithms, systems, protocols, and language semantics.\n- **Code Review:** Paste any snippet for time/space complexity analysis and edge-case auditing.\n- **Assessment Diagnostics:** Clarifications on quiz questions and targeted revision strategies.\n- **Mock Screening:** Simulated technical questions matched to ${plan?.goal.targetCompany || 'Tier-1 technology hiring bars'}.\n\nWhat would you like to master right now?`;
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      topicRef: activeLesson?.topic,
      suggestedAction,
    };
  },
};
