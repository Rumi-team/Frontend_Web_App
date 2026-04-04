export type UseCase = {
  slug: string
  h1: string
  emotionalTone: "vulnerable" | "empowering" | "pragmatic"
  painStatement: string
  rumiResponse: string
  whyDifferent: string
  ctaLabel: string
  ctaSubtext: string
  isSensitive: boolean
  safetyNote?: string
  metaTitle: string
  metaDescription: string
  relatedSlugs: string[]
}

export const useCases: UseCase[] = [
  {
    slug: "post-breakup",
    h1: "When you can't stop replaying it.",
    emotionalTone: "vulnerable",
    painStatement:
      "The relationship ended, but your mind won't let go. You're replaying conversations, second-guessing every decision, and the silence where they used to be is deafening. Friends say \"give it time\" but time just feels heavy.",
    rumiResponse:
      "Rumi won't tell you to move on. Instead, it listens while you say the things you never got to say. It helps you see the patterns that kept showing up, the beliefs about love you didn't know you were carrying, and what this relationship was actually teaching you. Then it follows up daily, so the clarity you find today doesn't disappear by Thursday.",
    whyDifferent:
      "Friends get tired of hearing about it. Therapists have hour-long waits. Rumi is available at 2am when the thoughts won't stop, completely private, completely patient.",
    ctaLabel: "Talk to someone now",
    ctaSubtext: "Private. Free during beta. No judgment.",
    isSensitive: false,
    metaTitle: "AI Coach for Breakup Recovery | Rumi",
    metaDescription:
      "Can't stop replaying the breakup? Rumi is a private AI voice coach that helps you process what happened, see the patterns, and actually move forward.",
    relatedSlugs: ["anxiety", "overthinking"],
  },
  {
    slug: "overthinking",
    h1: "Your brain won't shut up. We get it.",
    emotionalTone: "empowering",
    painStatement:
      "You think your way into paralysis. Every decision spirals into ten scenarios. You lie awake rehearsing conversations that haven't happened yet. People tell you to \"just stop thinking about it\" like that's a thing you can do.",
    rumiResponse:
      "Rumi gives your thoughts somewhere to go. When you talk through the spiral out loud, something shifts. Rumi helps you name what's really driving the loop, whether it's fear of getting it wrong, need for control, or something deeper. Once you see the engine, you can turn it off.",
    whyDifferent:
      "Journaling keeps you in your head. Rumi gets you out of it. Speaking out loud to a patient, private listener breaks the loop in a way writing can't.",
    ctaLabel: "Break the loop",
    ctaSubtext: "Private voice session. Free during beta.",
    isSensitive: false,
    metaTitle: "AI Coach for Overthinking | Rumi",
    metaDescription:
      "Stuck in thought spirals? Rumi is a private AI voice coach that helps overthinkers break the loop, name what's driving it, and find clarity.",
    relatedSlugs: ["anxiety", "imposter-syndrome"],
  },
  {
    slug: "therapy-between",
    h1: "The week between sessions is the hard part.",
    emotionalTone: "pragmatic",
    painStatement:
      "Your therapist helps you see things clearly for 50 minutes. Then you walk out into the same life that created the problems. By next Tuesday, the insight has faded and you're back to default. You need something between sessions.",
    rumiResponse:
      "Rumi isn't a replacement for therapy. It's the bridge between sessions. When an insight from Tuesday's session starts slipping away on Friday, Rumi helps you hold onto it. It gives you a space to practice what you're learning, process what comes up between appointments, and show up to your next session with more clarity, not less.",
    whyDifferent:
      "Your therapist can't be there at 11pm when the anxiety hits. Rumi can. It reinforces your therapeutic work without replacing it.",
    ctaLabel: "Try between sessions",
    ctaSubtext: "Complements therapy. Not a replacement.",
    isSensitive: true,
    safetyNote:
      "Rumi is an AI coaching tool, not a licensed therapist. If you are in crisis, please contact the 988 Suicide and Crisis Lifeline (call or text 988) or your local emergency services.",
    metaTitle: "AI Coach Between Therapy Sessions | Rumi",
    metaDescription:
      "Losing therapy insights between sessions? Rumi bridges the gap with private AI voice coaching that reinforces your therapeutic work 24/7.",
    relatedSlugs: ["anxiety", "post-breakup"],
  },
  {
    slug: "founders",
    h1: "It's lonely at the top. Especially at 2am.",
    emotionalTone: "pragmatic",
    painStatement:
      "You can't show weakness to your team. Your investors want confidence. Your co-founder has their own stress. The decisions keep coming and there's nobody to think out loud with who won't judge, panic, or try to fix you.",
    rumiResponse:
      "Rumi is the thinking partner founders don't have. Talk through the hard decisions out loud, without worrying about how it lands. Rumi helps you separate the signal from the noise, surface the fears hiding behind the \"strategy,\" and find the clarity that makes the next move obvious.",
    whyDifferent:
      "Executive coaches cost $500/hr and need scheduling. Rumi is available the moment you need to think out loud, whether that's before a board meeting or after a missed quarter.",
    ctaLabel: "Think out loud",
    ctaSubtext: "Private. Available 24/7. Free during beta.",
    isSensitive: false,
    metaTitle: "AI Coach for Startup Founders | Rumi",
    metaDescription:
      "Lonely at the top? Rumi is a private AI voice coach for founders who need to think out loud without judgment. Available 24/7.",
    relatedSlugs: ["imposter-syndrome", "career-transitions"],
  },
  {
    slug: "career-transitions",
    h1: "You know it's time to leave. You just can't pull the trigger.",
    emotionalTone: "empowering",
    painStatement:
      "The job isn't terrible. It's just not yours anymore. But the mortgage, the health insurance, the \"what if it's worse somewhere else\" keeps you frozen. You've been thinking about leaving for months but thinking isn't the same as deciding.",
    rumiResponse:
      "Rumi helps you untangle the real fears from the imagined ones. When you talk it through out loud, you start hearing what you actually want, underneath all the \"should\" and \"what if.\" Rumi surfaces the beliefs keeping you stuck and helps you build a mental framework for the transition, not just the decision.",
    whyDifferent:
      "Career coaches focus on resumes and interviews. Rumi focuses on the internal blockers that keep you from even starting.",
    ctaLabel: "Start figuring it out",
    ctaSubtext: "No pressure. No resume required.",
    isSensitive: false,
    metaTitle: "AI Coach for Career Transitions | Rumi",
    metaDescription:
      "Stuck in a career you've outgrown? Rumi is a private AI voice coach that helps you untangle the fear from the decision and find clarity.",
    relatedSlugs: ["founders", "imposter-syndrome"],
  },
  {
    slug: "anxiety",
    h1: "When the worry won't stop, you need somewhere to put it.",
    emotionalTone: "vulnerable",
    painStatement:
      "The tightness in your chest. The racing thoughts. The constant feeling that something bad is about to happen even when everything is fine. You've tried breathing exercises. They help for about four minutes.",
    rumiResponse:
      "Rumi gives you a place to say it all out loud. Not to fix it instantly, but to slow it down enough to see what's underneath. When you speak your worries to something patient and private, the weight shifts. Rumi helps you notice patterns in your anxiety, what triggers it, what feeds it, and what actually calms it.",
    whyDifferent:
      "Apps give you coping tools. Rumi gives you understanding. There's a difference between managing anxiety and understanding where it comes from.",
    ctaLabel: "Talk it through",
    ctaSubtext: "Private. Patient. Available right now.",
    isSensitive: true,
    safetyNote:
      "Rumi is an AI coaching tool, not a licensed mental health provider. If you are experiencing a mental health emergency, please contact the 988 Suicide and Crisis Lifeline (call or text 988), text HOME to 741741 (Crisis Text Line), or call your local emergency services.",
    metaTitle: "AI Coach for Anxiety | Rumi",
    metaDescription:
      "Anxiety won't stop? Rumi is a private AI voice coach that helps you understand your worry patterns and find calm. Available 24/7.",
    relatedSlugs: ["overthinking", "therapy-between"],
  },
  {
    slug: "parenting",
    h1: "You love them more than anything. And you're still exhausted.",
    emotionalTone: "vulnerable",
    painStatement:
      "Nobody tells you that parenting is the loneliest kind of busy. You're never alone but you're always alone with the hard stuff. The guilt about screen time. The fear you're doing it wrong. The version of yourself you can't find anymore.",
    rumiResponse:
      "Rumi is the 10 minutes of honest reflection you can't get anywhere else. Talk about the parenting guilt, the identity shift, the relationship strain, without being told you should be grateful. Rumi helps you find the parent you want to be underneath the parent you're running on autopilot as.",
    whyDifferent:
      "Parenting forums give advice. Rumi gives you space. There's no other parent judging your choices, just a private conversation about what you're actually feeling.",
    ctaLabel: "Take 10 minutes for yourself",
    ctaSubtext: "Private. No judgment. No parenting advice.",
    isSensitive: false,
    metaTitle: "AI Coach for Parents | Rumi",
    metaDescription:
      "Exhausted parent? Rumi is a private AI voice coach that gives you space to process the guilt, the identity shift, and everything nobody talks about.",
    relatedSlugs: ["anxiety", "career-transitions"],
  },
  {
    slug: "imposter-syndrome",
    h1: "You got the promotion. Now you're waiting to get caught.",
    emotionalTone: "empowering",
    painStatement:
      "Everyone thinks you belong here. You're not so sure. The more success you have, the more certain you are that you're faking it. Every meeting is a chance to be exposed. Every compliment feels like borrowed time.",
    rumiResponse:
      "Rumi helps you trace imposter syndrome back to its source. When you talk through it out loud, you start hearing how irrational the fear sounds, and more importantly, why it feels so real anyway. Rumi surfaces the specific beliefs driving the fraud feeling and helps you build evidence against them, from your own life.",
    whyDifferent:
      "Self-help tells you to \"believe in yourself.\" Rumi helps you understand why you don't, and builds the case for why you should, using your own words and experiences.",
    ctaLabel: "Start your first session",
    ctaSubtext: "Private. Takes 5 minutes. Free during beta.",
    isSensitive: false,
    metaTitle: "AI Coach for Imposter Syndrome | Rumi",
    metaDescription:
      "Feel like a fraud despite your success? Rumi is a private AI voice coach that helps you trace imposter syndrome to its source and build real confidence.",
    relatedSlugs: ["founders", "overthinking"],
  },
]
