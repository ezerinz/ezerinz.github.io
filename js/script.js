document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  let isProgrammaticScroll = false;
  let isScrolling;

  const text = [
    "Hi, I'm Edwin",
    "[blank]",
    "[comment]&lt;!-- about me --&gt;",
    "I'm a software developer from Indonesia,",
    "specializing in mobile app development using Flutter.",
    "I'm currently expanding my skills in web development",
    "with Svelte, Flask, and Laravel.",
    "[blank]",
    "[link:/portfolio][icon:fa-solid fa-arrow-right]View Projects",
    "[blank]",
    "[comment]&lt;!-- contacts --&gt;",
    "[link:https://github.com/ezerinz][icon:fa-brands fa-github] github/ezerinz",
    "[link:https://www.linkedin.com/in/edwin-edwin-80bb3529b/][icon:fa-brands fa-linkedin] linkedin/edwin",
  ];
  let con = "";

  for (let index = 0; index < text.length; index++) {
    const raw = text[index];
    let lineText = "";

    if (raw.startsWith("[blank]")) {
      lineText = '<div class="line-text">&nbsp;</div>';
    } else if (raw.startsWith("[comment]")) {
      const commentText = raw.replace("[comment]", "");
      lineText = `<div class="line-text comment">${commentText}</div>`;
    } else if (raw.startsWith("[link")) {
      // Match full pattern: [link:url][icon:class]Label
      const linkPattern = /^\[link(?::(.*?))?\](?:\[icon:(.*?)\])?(.*)$/;
      const match = raw.match(linkPattern);

      if (match) {
        const url = match[1] || match[2] || match[3]; // fallback just in case
        const iconClass = match[2] ? match[2].trim() : null;
        const label = match[3]?.trim() || url;

        const icon = iconClass
          ? `<i class="fa ${iconClass} icon" aria-hidden="true"></i> `
          : "";

        lineText = `<div class="line-text"><a href="${url}" target="_blank">${icon}${label}</a></div>`;
      } else {
        lineText = `<div class="line-text">${raw}</div>`;
      }
    } else if (raw.startsWith("[icon:")) {
      const iconPattern = /^\[icon:([a-zA-Z0-9- ]+)\](.*)$/;
      const match = raw.match(iconPattern);
      if (match) {
        const iconClass = match[1].trim();
        const label = match[2].trim();
        lineText = `<div class="line-text"><i class="fa ${iconClass} icon" aria-hidden="true"></i> ${label}</div>`;
      } else {
        lineText = `<div class="line-text">${raw}</div>`;
      }
    } else {
      lineText = `<div class="line-text">${raw}</div>`;
    }

    con += `<div class="line" id="line-${index + 1}">
            <div class="line-number">${index + 1}</div>
            ${lineText}
          </div>`;
  }
  content.innerHTML = con;

  let previousLine = 1;
  let currentLine = 1;

  function updateLine() {
    const lines = document.querySelectorAll(".line");

    lines.forEach((line) => {
      const lineNumberElement = line.querySelector(".line-number");
      const lineNumber = parseInt(line.id.split("-")[1]);
      if (lineNumber < currentLine) {
        lineNumberElement.innerHTML = `${currentLine - lineNumber}`;
      } else if (lineNumber > currentLine) {
        lineNumberElement.innerHTML = `${lineNumber - currentLine}`;
      } else {
        lineNumberElement.innerHTML = `${currentLine}`;
      }
    });

    //update higlight, update color line number
    const previousLineElement = document.getElementById(`line-${previousLine}`);
    const previousLineNumberElement =
      previousLineElement.querySelector(".line-number");
    previousLineNumberElement.style.marginLeft = "0";
    previousLineNumberElement.style.marginRight = "0";
    previousLineNumberElement.style.color = "#484d65";
    previousLineElement.style.backgroundColor = "transparent";

    const currentLineElement = document.getElementById(`line-${currentLine}`);
    const currentLineNumberElement =
      currentLineElement.querySelector(".line-number");
    currentLineNumberElement.style.marginLeft = "-0.5rem";
    currentLineNumberElement.style.marginRight = "0.5rem";
    currentLineNumberElement.style.color = "#ff9e64";
    currentLineElement.style.backgroundColor = "rgba(192, 202, 245, 0.1)";

    //update statusline
    const statusline = document.querySelector(".statusline");
    const percent = Math.round((currentLine / lines.length) * 100);
    statusline
      .querySelector(".position-percent")
      .querySelector(".text").innerHTML =
      currentLine == 1
        ? "Top"
        : currentLine == lines.length
          ? "Bot"
          : `${percent}%`;
    statusline.querySelector(".position").innerHTML = `${currentLine}:1`;
  }

  content.addEventListener("click", (event) => {
    const lineElement = event.target.closest(".line");
    if (lineElement) {
      previousLine = currentLine;
      currentLine = parseInt(lineElement.id.split("-")[1]);
      updateLine();
    }
  });

  function detectLines() {
    if (!isProgrammaticScroll) {
      const lines = document.querySelectorAll(".line");
      let mostUpLine = null;
      let mostBottomLine = null;
      let smallestDistanceTop = Infinity;
      let largestDistanceBottom = -Infinity;

      const viewportHeight = window.innerHeight;

      lines.forEach((line) => {
        const rect = line.getBoundingClientRect();
        const distanceFromTop = Math.abs(rect.top);
        const distanceFromBottom = rect.bottom - viewportHeight;

        if (rect.top >= 0 && rect.bottom <= viewportHeight) {
          if (distanceFromTop < smallestDistanceTop) {
            smallestDistanceTop = distanceFromTop;
            mostUpLine = line;
          }

          if (distanceFromBottom > largestDistanceBottom) {
            largestDistanceBottom = distanceFromBottom;
            mostBottomLine = line;
          }
        } else if (rect.top < 0 && rect.bottom > 0) {
          if (distanceFromTop < smallestDistanceTop) {
            smallestDistanceTop = distanceFromTop;
            mostUpLine = line;
          }
        } else if (rect.bottom > viewportHeight && rect.top < viewportHeight) {
          if (distanceFromBottom > largestDistanceBottom) {
            largestDistanceBottom = distanceFromBottom;
            mostBottomLine = line;
          }
        }
      });

      if (mostUpLine) {
        mostUpLine = parseInt(mostUpLine.id.split("-")[1]);
      }

      if (mostBottomLine) {
        mostBottomLine = parseInt(mostBottomLine.id.split("-")[1]) - 2;
      }

      if (currentLine < mostUpLine) {
        previousLine = currentLine;
        currentLine = mostUpLine;
        updateLine();
      }
      if (currentLine > mostBottomLine) {
        previousLine = currentLine;
        currentLine = mostBottomLine;
        updateLine();
      }
    }

    clearTimeout(isScrolling);

    isScrolling = setTimeout(() => {
      if (isProgrammaticScroll) {
        isProgrammaticScroll = false;
      }
    }, 100);
  }

  content.addEventListener("scroll", detectLines);

  function scrollToLine(lineNumber) {
    const line = document.getElementById(`line-${lineNumber}`);

    if (line) {
      const rect = line.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top < 0) {
        line.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      } else if (rect.bottom > viewportHeight - 24) {
        line.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "j" || event.key === "k") {
      const lines = Array.from(document.querySelectorAll(".line"));
      const index = lines.findIndex(
        (line) => parseInt(line.id.split("-")[1]) === currentLine,
      );
      isProgrammaticScroll = true;
      if (event.key === "j" && index < lines.length - 1) {
        previousLine = currentLine;
        currentLine = parseInt(lines[index + 1].id.split("-")[1]);
        scrollToLine(currentLine);
        updateLine();
      } else if (event.key === "k" && index > 0) {
        previousLine = currentLine;
        currentLine = parseInt(lines[index - 1].id.split("-")[1]);
        scrollToLine(currentLine);
        updateLine();
      }
      clearTimeout(isScrolling);
    }
  });

  updateLine();
});
