import MultiLevelPartitionGraph from "../graph/MultiLevelPartitionGraph";
async function main(dataName: string) {
  let MockRes = await fetch(`../src/assets/data/${dataName}`);
  // 原始数据20018点20147边，化简后2135点1502边，告警数130，聚合度强度0.89，力导引布局时间0.70s；化简比例，化简算法用时；画布分割算法用时，画布利用率，平均长宽比
  // let MockRes = await fetch('../src/assets/data/20000_processed.json');

  // 原始数据10030点10646边，化简后1048点902边，告警数117，聚合度强度0.97，力导引布局时间0.69s；化简比例，化简算法用时；画布分割算法用时，画布利用率，平均长宽比
  // let MockRes = await fetch('../src/assets/data/10000_processed.json');

  // 原始数据5891点6562边，化简后883点792边，告警数62，聚合度强度0.74，力导引布局时间0.68s
  // let MockRes = await fetch('../src/assets/data/6000_processed.json');

  // 原始数据2595点2277边，化简后300点274边，告警数40，聚合度强度0.78，力导引布局时间0.69s
  // let MockRes = await fetch('../src/assets/data/2500_processed.json');

  // 原始数据1569点1380边，化简后225点223边，告警数30，聚合度强度0.77，力导引布局时间0.68s
  // let MockRes = await fetch('../src/assets/data/1500_processed.json');

  // 原始数据511点402边，化简后54点48边，告警数10，聚合度强度0.77，力导引布局时间1.067s
  // let MockRes = await fetch('../src/assets/data/500_processed.json');

  // let MockRes = await fetch('../src/assets/data/long label.json');

  let Mock = await MockRes.json();
  console.log(Mock);

  const graph = new MultiLevelPartitionGraph({
    data: Mock,
    dataName: dataName,
    // 第一次
    // width: 1600,
    // height: 800,
    width: 1600,
    height: 1000,
    // 空白填充度和强度，可暴露出来让用户配置，blankFillDegree和blankFillStrength越大，填充部分越大
    divBoxSelector: "#main",
    emphasisName: "cnt",
    scaleThreshold: 1.5,
    blankFillDegree: 20,
    blankFillStrength: 1,
    nodeStyle: {
      normal: {
        radius: 15,
        opacity: 1,
        strokeWidth: 1,
        stroke: "none",
        fill: "none",
      },
      selected: {
        radius: 15,
        opacity: 1,
        strokeWidth: 5,
        stroke: "#2B41FF",
        fill: "none",
      },
    },
    nodeLabelStyle: {
      stroke: "black",
      strokeWidth: 1,
      fontSize: "8px",
      textAnchor: "middle",
      show: "auto",
    },
    edgeStyle: {
      normal: {
        opacity: 0.2,
        strokeWidth: 1,
        strokeColor: "gray",
        strokeDash: "solid",
      },
      selected: {
        opacity: 1,
        strokeWidth: 2,
        strokeColor: "#3980FE",
        strokeDash: "solid",
      },
    },
    maskStyle: {
      normal: {
        color: (d: any) => {
          if (d.data.hierarchy === "az") {
            return "#F7F7F7";
          } else if (d.data.hierarchy === "pod") {
            if (d.data.name === "cnt") {
              return "#B3F0FA";
            } else {
              return "#F7F7F7";
            }
          } else {
            throw new Error("当前层级不是level2或者level3");
          }
        },
        strokeColor: (d: any) => {
          if (d.data.hierarchy === "az") {
            return "gray";
          } else if (d.data.hierarchy === "pod") {
            return "gray";
          } else {
            throw new Error("当前层级不是level2或者level3");
          }
        },
        strokeWidth: (d: any) => {
          if (d.data.hierarchy === "az") {
            return 10;
          } else if (d.data.hierarchy === "pod") {
            return 3;
          } else {
            throw new Error("当前层级不是level2或者level3");
          }
        },
        opacity: 1,
      },
      selected: {
        color: "#CEDEFF",
        strokeColor: "#fff",
        strokeWidth: 5,
        opacity: 1,
      },
    },
    maskLabelStyle: {
      fill: (d: any) => {
        if (d.data.hierarchy === "az") {
          return "#000";
        } else {
          return "#555";
        }
      },
      opacity: 0.8,
      fontWeight: 800,
    },
  });
  // 绘制图例
  const drawLegend = () => {
    const iconTypeList: string[] = [
      "CORE",
      "hyperNode",
      "LEAF",
      "SERVER",
      "SPINE",
      "VIRTUAL",
    ];
    const legendDOM = document.querySelector("#legend");
    const getIconLegendTemplate = (type: string): string => `
      <div class='icon' id=${`${type}`}>
        <img src=${`src/assets/icon/normal-${type}.svg`} alt=${type}></img>
        <span>${type}</span>
      </div>
    `;
    (legendDOM as HTMLElement).innerHTML = iconTypeList
      .map((type: string) => getIconLegendTemplate(type))
      .join("");
  };
  // 绑定ip搜索和区域搜索
  const observeSearch = () => {
    const searchIpInput = document.querySelector("#ip");
    const searchIpBtn = document.querySelector("#search-by-ip button");
    (searchIpBtn as HTMLButtonElement).addEventListener("click", () => {
      const ip = (searchIpInput as HTMLInputElement).value;
      let searchIpResult = graph.searchIp(ip);
    });
    const searchAZInput = document.querySelector("#az");
    const searchPodInput = document.querySelector("#pod");
    const searchPartitionBtn = document.querySelector("#search-by-pod button");
    (searchPartitionBtn as HTMLButtonElement).addEventListener("click", () => {
      let azInput = (searchAZInput as HTMLInputElement).value;
      let podInput = (searchPodInput as HTMLInputElement).value;
      let serarchPartitionResult = graph.searchPartition(
        azInput,
        podInput,
        true,
        true,
        {
          nodeStyle: {
            stroke: "black",
            opacity: 1,
            strokeWidth: 5,
          },
          edgeStyle: {
            strokeColor: "red",
            strokeWidth: 3,
            opacity: 1,
            strokeDash: "solid",
          },
          maskStyle: {
            opacity: 1,
            color: "pink",
            strokeWidth: 2,
            strokeColor: "blue",
          },
        }
      );
    });
  };
  drawLegend();
  observeSearch();
}
// 第一次
// let dataName: string = '10000_processed.json';
// 区域分隔力导引极限效果 40 12 12
// let dataName:string = 'deep_236_115.json'; // 20 15 15
let dataName: string = "20000_delete.json";
main(dataName);

async function deleteData() {
  const res = await fetch("../src/assets/data/20000_processed.json");
  const originData = await res.json();
  const originGroups = originData.groupList;
  const originGroupLinks = originData.groupLinks;
  const deletedGroupIndexList: any = [];
  const resultGroups: any = [];
  const resultGroupLinks: any = [];
  const podHypernumMap: any = {};
  // 删除一些cluster得到group result
  for (let i = 0; i < originGroups.length; i++) {
    const curGroup = originGroups[i];
    // 删除超点，每个pod只保留一个超点
    if (curGroup.isHyperNode) {
      const curGroupPodIdentifier = `${curGroup.children[0].az}-${curGroup.children[0].pod_name}`;
      // 保证每个pod至少有一个hyperNode
      if (!podHypernumMap[curGroupPodIdentifier] && Math.random() > 0.9) {
        podHypernumMap[curGroupPodIdentifier] = 1;
        resultGroups.push(curGroup);
      } else {
        if (Math.random() > 0) {
          deletedGroupIndexList.push(curGroup.groupIndex);
        } else {
          resultGroups.push(curGroup);
        }
      }
    } else {
      // 剔除百分之60的非超点
      if (
        Math.random() > 0 &&
        curGroup.children[0].role !== "CORE" &&
        !curGroup.children[0].is_alarming
      ) {
        deletedGroupIndexList.push(curGroup.groupIndex);
      } else if (!curGroup.children[0].is_alarming) {
        if (!hasRelateGroup(curGroup, originGroupLinks)) {
          deletedGroupIndexList.push(curGroup.groupIndex);
        } else {
          resultGroups.push(curGroup);
        }
      } else {
        resultGroups.push(curGroup);
      }
    }
  }
  for (let i = 0; i < originGroupLinks.length; i++) {
    const curLink = originGroupLinks[i];
    if (
      deletedGroupIndexList.findIndex((d) => d === curLink.source) === -1 &&
      deletedGroupIndexList.findIndex((d) => d === curLink.target) === -1
    ) {
      resultGroupLinks.push(curLink);
    }
  }
  const result = {
    compressionRatio: 0.738353765323993,
    groupList: resultGroups,
    groupLinks: resultGroupLinks,
  };
  console.log("rr", result);
}
function hasRelateGroup(curGroup, groupLinks) {
  return (
    groupLinks.findIndex(
      (d) =>
        d.source === curGroup.groupIndex || d.target === curGroup.groupIndex
    ) !== -1
  );
}
deleteData();
