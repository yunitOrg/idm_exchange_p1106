export default {
  data() {
    return {
      propData: this.$root.propData.compositeAttr || {
        showTitle: true,
        tabData: 'static',
        height: '489px',
        tabwidth: '100%',
        heightType: 'fixed',
        contentEchartsHeight: '350px',
        resContent: 'drag',
        tabheight: '48px',
        tabRightLeftDis: '10px',
        splitWidth: '1px',
        splitHeight: '40%',
        showLine: true,
        firstShow: true,
        lineBottom: "0px",
        splitRight: '-10px',
        boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.07)",
        boxborder:{
          "border": {
            "top": {
                "style": "solid",
                "width": 1,
                "widthUnit": "px",
                "colors": {
                  "hex8": "#e6e6e6"
                }
            },
            "right": {
                "style": "solid",
                "width": 1,
                "widthUnit": "px",
                "colors": {
                  "hex8": "#e6e6e6"
                }
            },
            "bottom": {
                "style": "solid",
                "width": 1,
                "widthUnit": "px",
                "colors": {
                  "hex8": "#e6e6e6"
                }
            },
            "left": {
                "style": "solid",
                "width": 1,
                "widthUnit": "px",
                "colors": {
                  "hex8": "#e6e6e6"
                }
            }
        },
          "radius": {
              "leftTop": {
                  "radius": 0,
                  "radiusUnit": "px"
              },
              "rightTop": {
                  "radius": 0,
                  "radiusUnit": "px"
              },
              "leftBottom": {
                  "radius": 0,
                  "radiusUnit": "px"
              },
              "rightBottom": {
                  "radius": 0,
                  "radiusUnit": "px"
              }
            }
          },
        lineColor: {
          "hex": "#025FB2",
          "hex8": "#025FB2"
        },
        lineSize: 2,
        splitColor: {
          "hex": "#ddd",
          "hex8": "#ddd"
        },
        contentBox: {
          "marginTopVal": "",
          "marginRightVal": "",
          "marginBottomVal": "",
          "marginLeftVal": "",
          "paddingTopVal": "15px",
          "paddingRightVal": "",
          "paddingBottomVal": "",
          "paddingLeftVal": ""
        },
        ulbox: {
          "marginTopVal": "",
          "marginRightVal": "",
          "marginBottomVal": "",
          "marginLeftVal": "",
          "paddingTopVal": "",
          "paddingRightVal": "20px",
          "paddingBottomVal": "0",
          "paddingLeftVal": "20px"
        },
        titleFont: {
          "fontColors": {
              "hex": "#333333",
              "hex8": "#333333FF"
            },
            "fontLineHeight": 48,
            "fontLineHeightUnit": "px",
            "fontSize": 14,
            "fontSizeUnit": "px"
        },
        tabList: [
          {
            value: '1',
            label: '关键指数详解',
          },
          {
            value: '2',
            label: '次数调用',
            showTab: true
          },
          {
            value: '3',
            label: '失败率'
          },
        ],
        chooseTitleFont: {
          "fontColors": {
              "hex": "#025FB2",
              "hex8": "#025FB2FF"
            },
            "fontLineHeight": 48,
            "fontLineHeightUnit": "px",
            "fontSize": 14,
            "fontSizeUnit": "px",
        },
        tabBorder: {
            "border": {
              "top": {
                  "style": "solid",
                  "width": 0,
                  "widthUnit": "px",
                  "colors": {
                    "hex8": ""
                  }
              },
              "right": {
                  "style": "solid",
                  "width": 0,
                  "widthUnit": "px",
                  "colors": {
                    "hex8": ""
                  }
              },
              "bottom": {
                  "style": "solid",
                  "width": 1,
                  "widthUnit": "px",
                  "colors": {
                    "hex8": "#ddd"
                  }
              },
              "left": {
                  "style": "solid",
                  "width": 0,
                  "widthUnit": "px",
                  "colors": {
                    "hex8": ""
                  }
              }
          },
            "radius": {
                "leftTop": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "rightTop": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "leftBottom": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "rightBottom": {
                    "radius": 0,
                    "radiusUnit": "px"
                }
              }
            }
      }
    }
  }
}