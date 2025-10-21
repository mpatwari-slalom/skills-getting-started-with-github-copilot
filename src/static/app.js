document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic info
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsSection.appendChild(participantsTitle);

        const participantsListEl = document.createElement("ul");
        participantsListEl.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            
            const emailSpan = document.createElement("span");
            emailSpan.textContent = p;
            li.appendChild(emailSpan);

            const deleteIcon = document.createElement("span");
            deleteIcon.innerHTML = "✕";
            deleteIcon.className = "delete-participant";
            deleteIcon.title = "Remove participant";
            
            // Add click handler for unregistering
            deleteIcon.addEventListener("click", async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`,
                  {
                    method: "DELETE",
                  }
                );

                const result = await response.json();

                if (response.ok) {
                  // Remove the list item immediately for instant feedback
                  li.remove();
                  
                  // Show success message
                  messageDiv.textContent = result.message;
                  messageDiv.className = "message success";
                  messageDiv.classList.remove("hidden");

                  // Hide message after 5 seconds
                  setTimeout(() => {
                    messageDiv.classList.add("hidden");
                  }, 5000);

                  // If no participants left, show the "No participants" message
                  if (participantsListEl.children.length === 0) {
                    const noParticipants = document.createElement("li");
                    noParticipants.className = "no-participants";
                    noParticipants.textContent = "No participants yet";
                    participantsListEl.appendChild(noParticipants);
                  }
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "message error";
                  messageDiv.classList.remove("hidden");
                }
              } catch (error) {
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "message error";
                messageDiv.classList.remove("hidden");
                console.error("Error unregistering:", error);
              }
            });

            li.appendChild(deleteIcon);
            participantsListEl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "No participants yet";
          participantsListEl.appendChild(li);
        }

        participantsSection.appendChild(participantsListEl);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Find the activity card and update its participants list
        const activityCards = document.querySelectorAll('.activity-card');
        for (const card of activityCards) {
          if (card.querySelector('h4').textContent === activity) {
            const participantsList = card.querySelector('.participants-list');
            // Remove "No participants" message if it exists
            const noParticipants = participantsList.querySelector('.no-participants');
            if (noParticipants) {
              noParticipants.remove();
            }
            
            // Add the new participant
            const li = document.createElement("li");
            li.className = "participant-item";
            
            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;
            li.appendChild(emailSpan);

            const deleteIcon = document.createElement("span");
            deleteIcon.innerHTML = "✕";
            deleteIcon.className = "delete-participant";
            deleteIcon.title = "Remove participant";
            
            // Add click handler for unregistering
            deleteIcon.addEventListener("click", async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
                  {
                    method: "DELETE",
                  }
                );

                const result = await response.json();

                if (response.ok) {
                  // Remove the list item immediately for instant feedback
                  li.remove();
                  
                  // Show success message
                  messageDiv.textContent = result.message;
                  messageDiv.className = "message success";
                  messageDiv.classList.remove("hidden");

                  // Hide message after 5 seconds
                  setTimeout(() => {
                    messageDiv.classList.add("hidden");
                  }, 5000);

                  // If no participants left, show the "No participants" message
                  if (participantsList.children.length === 0) {
                    const noParticipants = document.createElement("li");
                    noParticipants.className = "no-participants";
                    noParticipants.textContent = "No participants yet";
                    participantsList.appendChild(noParticipants);
                  }
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "message error";
                  messageDiv.classList.remove("hidden");
                }
              } catch (error) {
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "message error";
                messageDiv.classList.remove("hidden");
                console.error("Error unregistering:", error);
              }
            });

            li.appendChild(deleteIcon);
            participantsList.appendChild(li);
            break;
          }
        }
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
