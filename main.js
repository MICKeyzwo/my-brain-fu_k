(_ => {
  "use strict";

  //タイトルの治安を悪くするやつ
  {
    const title = document.querySelector("h1");
    const randomInt = max => (Math.random() * max) | 0;
    const colorTimer = setInterval(_ => {
      const colors = [randomInt(256), randomInt(256), randomInt(256)];
      title.style.color = `rgb(${colors[0]},${colors[1]},${colors[2]})`;
    }, 1000 / 30);
  }

  //検索クエリを確認，値が設定されていればそれを反映させる
  {
    const condElms = [...document.getElementsByName("commands")];
    location.search && decodeURIComponent(location.search)
      .replace("?", "")
      .split("&")
      .forEach((q, idx) => {
        const query = q.split("=");
        if (query[0] == idx) {
          condElms[idx].value = query[1];
        }
      });
  }

  //コマンド群のバリデーション，重複を検知してスタイルの適用などを行う
  const validateCommands = _ => {
    const condElms = [...document.getElementsByName("commands")];
    condElms.forEach(elm => {
      elm.className = "form-control";
    });
    const cmds = condElms.map(elm => elm.value.trim());
    const resultElm = document.getElementById("result");
    const errIdx = [];
    for (let i = 0; i < cmds.length; i++) {
      if (cmds[i] == "") {
        errIdx.push(i);
        continue;
      }
      for (let j = 0; j < cmds.length; j++) {
        if (i == j || cmds[i].length < cmds[j].length || cmds[j].length == 0) continue;
        if (cmds[i].includes(cmds[j])) {
          errIdx.push(i), errIdx.push(j);
        }
      }
    }
    if (errIdx.length) {
      errIdx.forEach(idx => {
        condElms[idx].className += " is-invalid";
      });
      resultElm.className = "warn-text";
      resultElm.textContent = "Warning! Irregal commands!";
      return false;
    }
    resultElm.className = "";
    resultElm.textContent = "";
    return true;
  };

  //コマンド群の入力に際してのバリデーションの設定
  [...document.getElementsByName("commands")].forEach(elm => {
    elm.addEventListener("input", e => {
      validateCommands();
    });
  });

  //brain fu*kの本体
  document.getElementById("run").addEventListener("click", _ => {

    if (!validateCommands()) return;
    const rawCode = document.getElementById("code").value;
    const rawInput = document.getElementById("input").value;
    const resultElm = document.getElementById("result");
    resultElm.className = "";
    resultElm.textContent = "";
    const rawCond = [...document.getElementsByName("commands")].map(elm => elm.value.trim());
    const cond = [">", "<", "+", "-", ",", ".", "[", "]"];
    const code = [];
    let compTmp = "";
    rawCode.split("").forEach(s => {
      compTmp += s;
      for (let i = 0; i < rawCond.length; i++) {
        if (compTmp.endsWith(rawCond[i])) {
          code.push(cond[i]);
          compTmp = "";
          break;
        }
      }
    });

    const memo = new Uint32Array(1000);
    let progPtr = 0, memoPtr = 0, inptPtr = 0;
    let output = "";
    while (progPtr < code.length) {
      const token = code[progPtr];
      if (token == ">") memoPtr++;
      else if (token == "<") memoPtr--;
      else if (token == "+") memo[memoPtr]++;
      else if (token == "-") memo[memoPtr]--;
      else if (token == ",") memo[memoPtr] = rawInput.charCodeAt(inptPtr++);
      else if (token == ".") output += String.fromCharCode(memo[memoPtr]);
      else if (token == "[") progPtr = memo[memoPtr] == 0 ? code.indexOf("]", progPtr) : progPtr;
      else if (token == "]") progPtr = code.lastIndexOf("[", progPtr) - 1;
      progPtr++;
    }
    resultElm.textContent = output;

  });

  //Hello Worldの自動生成機能
  document.getElementById("hello").addEventListener("click", _ => {
    if (!validateCommands()) return;
    const helloWorld = `+++++++++[>++++++++>+++++++++++>+++++<<<-]>.>++.+++++++..+++.>-.------------.<++++++++.--------.+++.------.--------.>+.`;
    const rawCond = [...document.getElementsByName("commands")].map(elm => elm.value.trim());
    const cond = [">", "<", "+", "-", ",", ".", "[", "]"];
    let res = "";
    [...helloWorld].forEach((c, idx) => {
      res += rawCond[cond.indexOf(c)];
    });
    document.getElementById("code").value = res;
  });

  //リンクジェネレータ，オレオレBrain Fu*kのリンクを生成してみんなで遊ぼう！！
  document.getElementById("make-link").addEventListener("click", _ => {
    if (!validateCommands()) return;
    let addr = document.location + "";
    const queryPos = addr.indexOf("?");
    if (queryPos != -1) addr = addr.substr(0, queryPos);
    addr += "?";
    let query = "";
    [...document.getElementsByName("commands")].forEach((elm, idx) => {
      query += (idx != 0 ? "&" : "") + idx + "=" + elm.value;
    });
    document.getElementById("result").textContent = addr + encodeURIComponent(query);
});

})()
