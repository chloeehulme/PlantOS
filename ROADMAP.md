# PlantOS Roadmap

## Vision

PlantOS is a fun way for me to keep better track of my plants (killed a few too many) and to train my C# muscles. I’d like to keep growing it into something more useful over time, and my goal is to continue working on this little by little. Right now I’m focusing on building a stronger foundation, but longer term I’d love to add smarter care guidance, outdoor gardening support, and eventually even beekeeping features (my dream).

## Current Focus / Immediate TODOs

Here are the next few things I want to work through:

1. Add a README
2. Add Copilot agents
3. Get started on background workers
4. More robust exception handling

## Roadmap Overview

3-tiered cake:

- Short-term actions: quality improvements, better structure, and making the project easier to maintain
- Medium-term feature development: richer plant care workflows and a bit more automation
- Long-term shaping: expanding the idea into a broader gardening guidance project

---

## Phase 1: Foundation and Quality Improvements

### Priority: High — Foundation

These are the things I want to tackle first so the project feels more solid before I add more complexity.

- Create a unit test suite on a dedicated feature branch
- Merge the test suite into main
- Add CI on the main branch, including automated unit tests
- Add GitHub agent files for:
  - writing and maintaining tests
  - updating project documentation
- Add a README to document the project, architecture, workflows, and roadmap
- Continue refining the current implementation with quality improvements such as:
  - security hardening
  - cancellation token support
  - general reliability and maintainability improvements

---

## Phase 2: Care Event Enhancements

### Priority: High

I want to expand the event model so the app becomes more useful for everyday plant care.

- Merge the existing water event branch
- Add more event types such as:
  - fertilised
  - repotted
  - pruned
  - pest detection
- Continue refining how plant events are stored, surfaced, and managed

---

## Phase 3: Smarter Plant Care Experience

### Priority: Medium — Care Experience

Once the event system is in place, I want to focus on richer plant care workflows.

- Explore plant status tracking
- Add scheduling and reminder capabilities
- Introduce background services
- Improve user experience around reminders and care history

---

## Phase 4: Intelligent Assistance

### Priority: Medium — Intelligence

I’d like to add some intelligent features that help me make better care decisions.

- Integrate AI to generate care tips and hints
- Use AI to support plant-specific guidance based on events and history
- Consider future recommendations for watering, feeding, and environmental conditions

---

## Phase 5: Broader Gardening Support

### Priority: Longer term

I’d eventually like to expand PlantOS beyond indoor plant management into broader gardening use cases.

- Support vegetable gardening outdoors (including support for overwintering my biggest op: every chilli plant I have ever owned)
- Integrate with a weather API for location-relevant insights
- Add outdoor growing-specific workflows and recommendations
- Explore a richer front-end experience that makes ongoing care feel more engaging and interactive over time

---

## Phase 6: Long-Term Product Expansion

### Priority: Long term

I’d like to broaden the project into adjacent domains over time.

- Explore support for beekeeping (over/unders on this feature being built before I can afford to own a home and get some bees)
- Consider additional domain-specific modules and integrations
- Grow the product from a plant tracker into a broader nature-y platform

---

## Suggested Delivery Order

1. Foundation and test infrastructure
2. CI and documentation improvements
3. Event system enhancements
4. Scheduling, reminders, and background work
5. AI-powered guidance
6. Outdoor gardening support
7. Beekeeping and broader product expansion

---

## Notes

- I am reading Pro C#10 with .NET 6 and hope to use this project to test out some of the cool things I learn.
- I want to keep feature work focused and branch-driven where possible (Git FLow baby).
- Quality, reliability, and maintainability will stay important as I build this out.
- I’ll revisit this roadmap as the project evolves and my ideas become clearer.
