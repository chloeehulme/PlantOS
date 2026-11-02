# PlantOS Roadmap

## Vision

PlantOS is a fun way for me to keep better track of my plants (killed a few too many) and to train my C# muscles. I’d like to keep growing it into something more useful over time, and my goal is to continue working on this little by little. Right now I’m focusing on making the core experience feel like a cohesive game while continuing to strengthen the foundation. Longer term I’d love to add smarter care guidance, outdoor gardening support, and eventually even beekeeping features (my dream).

## Current Focus / Immediate TODOs

The immediate priority is to make PlantOS feel like a cohesive game before adding more care automation.

### Interaction Scope: Verify, Then Pause

- Confirm `[E]` reliably opens the nearby plant's interaction menu
- Support the basic plant actions: view plant details, add/update/delete care events, and delete a plant
- Once these work reliably, pause interaction feature work until after the visual experience is in place
- Avoid expanding the interaction feature set during the full-screen and visual-style milestones

## 1. Make the PixiJS Game Full-Screen

- Expand the PixiJS game world to fill the screen
- Make the game world the primary way to use PlantOS
- Move remaining player-facing plant features into the game experience
- Verify all existing plant functionality remains accessible from the game

## 2. Establish and Apply the Game's Visual Style

- Decide on the visual direction before creating or replacing art assets
- Apply that direction consistently to the world, tiles, player, plants, and in-game UI
- Replace placeholder shapes with art that fits the chosen style
- Polish visual feedback and transitions so interactions feel part of the game

## 3. Add Reminders and Background Work

- Design scheduling and reminder workflows around plant-care events
- Add background services to process scheduled care reminders
- Present reminders in a way that fits the game experience

## Roadmap Overview

3-tiered cake:

- Short-term actions: quality improvements, better structure, and making the project easier to maintain
- Medium-term feature development: richer plant care workflows and a bit more automation
- Long-term shaping: expanding the idea into a broader gardening guidance project

---

## Phase 1: Foundation and Quality Improvements

### Priority: High — Foundation

These foundational items support feature work and should continue alongside the game and care milestones.

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

## Phase 2: Full-Screen Game Experience and Visual Style

### Priority: High — Current Focus

Make the game world the primary PlantOS experience before adding care automation.

- Expand PixiJS to fill the screen
- Keep existing plant-management functionality accessible from the game
- Choose the visual direction, then apply it consistently to the world, characters, plants, and interface
- Replace placeholder shapes and polish visual feedback to fit that direction

---

## Phase 3: Reminders and Background Work

### Priority: High — After the Game Experience

Once the full-screen game experience and its visual direction are in place, add richer plant-care workflows.

- Explore plant status tracking
- Add scheduling and reminder capabilities
- Introduce background services
- Improve user experience around reminders and care history

---

## Phase 4: Care Event Enhancements

### Priority: Medium — After Reminders

I want to expand the event model so the app becomes more useful for everyday plant care.

- Merge the existing water event branch
- Add more event types such as:
  - fertilised
  - repotted
  - pruned
  - pest detection
- Continue refining how plant events are stored, surfaced, and managed

---

## Phase 5: Intelligent Assistance

### Priority: Medium — Intelligence

I’d like to add some intelligent features that help me make better care decisions.

- Integrate AI to generate care tips and hints
- Use AI to support plant-specific guidance based on events and history
- Consider future recommendations for watering, feeding, and environmental conditions

---

## Phase 6: Broader Gardening Support

### Priority: Longer term

I’d eventually like to expand PlantOS beyond indoor plant management into broader gardening use cases.

- Support vegetable gardening outdoors (including support for overwintering my biggest op: every chilli plant I have ever owned)
- Integrate with a weather API for location-relevant insights
- Add outdoor growing-specific workflows and recommendations
- Explore a richer front-end experience that makes ongoing care feel more engaging and interactive over time

---

## Phase 7: Long-Term Product Expansion

### Priority: Long term

I’d like to broaden the project into adjacent domains over time.

- Explore support for beekeeping (over/unders on this feature being built before I can afford to own a home and get some bees)
- Consider additional domain-specific modules and integrations
- Grow the product from a plant tracker into a broader nature-y platform

---

## Suggested Delivery Order

1. Verify the minimum plant interaction and event-management actions work reliably
2. Make PixiJS the full-screen, primary plant-management experience
3. Choose and apply the game's visual style
4. Add scheduling, reminders, and background work
5. Expand care-event types and workflows
6. Add AI-powered guidance
7. Add outdoor gardening support
8. Explore beekeeping and broader product expansion

Foundation work such as tests, CI, security, and maintainability improvements should continue alongside these feature milestones.

---

## Notes

- I am reading Pro C#10 with .NET 6 and hope to use this project to test out some of the cool things I learn.
- I want to keep feature work focused and branch-driven where possible (Git FLow baby).
- Quality, reliability, and maintainability will stay important as I build this out.
- I’ll revisit this roadmap as the project evolves and my ideas become clearer.
