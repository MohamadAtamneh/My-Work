import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from '../models/Template.js';
import fs from 'fs';

dotenv.config(); // Must come before using process.env


const modernImage = fs.readFileSync("../BackEnd/data/ModernProfessional.png", { encoding: "base64" });
const classicImage = fs.readFileSync("../BackEnd/data/ClassicElegant.png", { encoding: "base64" });
const creativeImage = fs.readFileSync("../BackEnd/data/CreativeBold.png", { encoding: "base64" });
const minimalImage = fs.readFileSync("../BackEnd/data/MinimalClean.png", { encoding: "base64" });
const darkVisionImage = fs.readFileSync("../BackEnd/data/DarkVision.png", { encoding: "base64" });
const neoElegantImage = fs.readFileSync("../BackEnd/data/NeoElegant.png", { encoding: "base64" });



const templates = [
  // ==========================================
  // 1. MODERN PROFESSIONAL TEMPLATE
  // ==========================================
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean and contemporary design with accent borders",
    imageUrl: `data:image/png;base64,${modernImage}`,
    category: "professional",
    thumbnail: "/thumbnails/modern.png",

    theme: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#0ea5e9",
        text: "#1e293b",
        background: "#ffffff"
      },
      fonts: {
        heading: "font-bold",
        body: "font-normal"
      }
    },

    structure: {
      type: "container",
      style: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px",
        backgroundColor: "background",
        color: "text"
      },
      sections: [
        // Header Section
        {
          id: "header",
          type: "section",
          style: {
            borderLeft: "4px solid",
            borderColor: "primary",
            paddingLeft: "24px",
            marginBottom: "32px"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.name",
              style: {
                fontSize: "36px",
                fontWeight: "bold",
                color: "primary",
                marginBottom: "8px"
              }
            },
            {
              type: "text",
              dataPath: "personalInfo.title",
              style: {
                fontSize: "20px",
                color: "secondary",
                marginBottom: "16px"
              }
            },
            {
              type: "contact-row",
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                fontSize: "14px",
                color: "secondary"
              },
              items: [
                { icon: "mail", dataPath: "personalInfo.email" },
                { icon: "phone", dataPath: "personalInfo.phone" },
                { icon: "map-pin", dataPath: "personalInfo.location" }
              ]
            }
          ]
        },

        // Summary Section
        {
          id: "summary",
          type: "section",
          showTitle: true,
          title: "Professional Summary",
          titleIcon: "file-text",
          style: {
            marginBottom: "32px"
          },
          titleStyle: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "primary",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.summary",
              style: {
                lineHeight: "1.6"
              }
            }
          ]
        },

        // Experience Section
        {
          id: "experience",
          type: "repeatable-section",
          showTitle: true,
          title: "Experience",
          titleIcon: "briefcase",
          dataPath: "experience",
          style: {
            marginBottom: "32px"
          },
          titleStyle: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "primary",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          itemStyle: {
            marginBottom: "24px",
            borderLeft: "2px solid",
            borderColor: "accent",
            paddingLeft: "16px"
          },
          elements: [
            {
              type: "text",
              dataPath: "title",
              style: {
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "4px"
              }
            },
            {
              type: "text",
              dataPath: "company",
              template: "{company} | {location}",
              style: {
                fontWeight: "600",
                color: "secondary",
                marginBottom: "4px"
              }
            },
            {
              type: "text",
              dataPath: "startDate",
              template: "{startDate} - {endDate}",
              style: {
                fontSize: "14px",
                color: "secondary",
                marginBottom: "8px"
              }
            },
            {
              type: "list",
              dataPath: "description",
              listStyle: "disc",
              style: {
                marginLeft: "16px",
                fontSize: "14px"
              },
              itemStyle: {
                marginBottom: "4px"
              }
            }
          ]
        },

        // Education Section
        {
          id: "education",
          type: "repeatable-section",
          showTitle: true,
          title: "Education",
          titleIcon: "graduation-cap",
          dataPath: "education",
          style: {
            marginBottom: "32px"
          },
          titleStyle: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "primary",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          itemStyle: {
            marginBottom: "16px"
          },
          elements: [
            {
              type: "text",
              dataPath: "degree",
              style: {
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "4px"
              }
            },
            {
              type: "text",
              dataPath: "institution",
              template: "{institution} | {location}",
              style: {
                color: "secondary"
              }
            },
            {
              type: "text",
              dataPath: "year",
              template: "Graduated: {year} | GPA: {gpa}",
              style: {
                fontSize: "14px",
                color: "secondary"
              }
            }
          ]
        },

        // Skills Section
        {
          id: "skills",
          type: "section",
          showTitle: true,
          title: "Skills",
          titleIcon: "award",
          style: {
            marginBottom: "32px"
          },
          titleStyle: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "primary",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          elements: [
            {
              type: "tag-list",
              dataPath: "skills",
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: "8px"
              },
              tagStyle: {
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: "primary",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600"
              }
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 2. CLASSIC ELEGANT TEMPLATE
  // ==========================================
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    description: "Traditional professional layout with centered header",
    imageUrl: `data:image/png;base64,${classicImage}`,
    category: "professional",
    thumbnail: "/thumbnails/classic.png",

    theme: {
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#374151",
        text: "#111827",
        background: "#ffffff"
      },
      fonts: {
        heading: "font-bold",
        body: "font-normal"
      }
    },

    structure: {
      type: "container",
      style: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "32px",
        backgroundColor: "background",
        color: "text"
      },
      sections: [
        // Header Section (Centered)
        {
          id: "header",
          type: "section",
          style: {
            textAlign: "center",
            marginBottom: "32px",
            paddingBottom: "24px",
            borderBottom: "2px solid",
            borderColor: "primary"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.name",
              style: {
                fontSize: "36px",
                fontWeight: "bold",
                color: "primary",
                marginBottom: "8px"
              }
            },
            {
              type: "text",
              dataPath: "personalInfo.title",
              style: {
                fontSize: "18px",
                color: "secondary",
                marginBottom: "12px"
              }
            },
            {
              type: "contact-row",
              style: {
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                fontSize: "14px",
                color: "secondary"
              },
              separator: "•",
              items: [
                { dataPath: "personalInfo.email" },
                { dataPath: "personalInfo.phone" },
                { dataPath: "personalInfo.location" }
              ]
            }
          ]
        },

        // Summary Section
        {
          id: "summary",
          type: "section",
          showTitle: true,
          title: "SUMMARY",
          style: {
            marginBottom: "24px"
          },
          titleStyle: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "primary",
            letterSpacing: "2px",
            marginBottom: "12px"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.summary",
              style: {
                textAlign: "justify",
                lineHeight: "1.6"
              }
            }
          ]
        },

        // Experience Section
        {
          id: "experience",
          type: "repeatable-section",
          showTitle: true,
          title: "PROFESSIONAL EXPERIENCE",
          dataPath: "experience",
          style: {
            marginBottom: "24px"
          },
          titleStyle: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "primary",
            letterSpacing: "2px",
            marginBottom: "12px"
          },
          itemStyle: {
            marginBottom: "20px"
          },
          elements: [
            {
              type: "flex-row",
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              },
              elements: [
                {
                  type: "group",
                  elements: [
                    {
                      type: "text",
                      dataPath: "title",
                      style: {
                        fontSize: "18px",
                        fontWeight: "bold"
                      }
                    },
                    {
                      type: "text",
                      dataPath: "company",
                      template: "{company}, {location}",
                      style: {
                        fontStyle: "italic",
                        color: "secondary"
                      }
                    }
                  ]
                },
                {
                  type: "text",
                  dataPath: "startDate",
                  template: "{startDate} - {endDate}",
                  style: {
                    fontSize: "14px",
                    color: "secondary"
                  }
                }
              ]
            },
            {
              type: "list",
              dataPath: "description",
              listStyle: "disc",
              style: {
                marginLeft: "16px",
                marginTop: "8px"
              },
              itemStyle: {
                marginBottom: "4px"
              }
            }
          ]
        },

        // Education Section
        {
          id: "education",
          type: "repeatable-section",
          showTitle: true,
          title: "EDUCATION",
          dataPath: "education",
          style: {
            marginBottom: "24px"
          },
          titleStyle: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "primary",
            letterSpacing: "2px",
            marginBottom: "12px"
          },
          itemStyle: {
            marginBottom: "12px"
          },
          elements: [
            {
              type: "flex-row",
              style: {
                display: "flex",
                justifyContent: "space-between"
              },
              elements: [
                {
                  type: "group",
                  elements: [
                    {
                      type: "text",
                      dataPath: "degree",
                      style: {
                        fontWeight: "bold"
                      }
                    },
                    {
                      type: "text",
                      dataPath: "institution",
                      template: "{institution}, {location}",
                      style: {
                        color: "secondary"
                      }
                    }
                  ]
                },
                {
                  type: "text",
                  dataPath: "year",
                  style: {
                    fontSize: "14px",
                    color: "secondary"
                  }
                }
              ]
            }
          ]
        },

        // Skills Section
        {
          id: "skills",
          type: "section",
          showTitle: true,
          title: "TECHNICAL SKILLS",
          titleStyle: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "primary",
            letterSpacing: "2px",
            marginBottom: "12px"
          },
          elements: [
            {
              type: "text",
              dataPath: "skills",
              template: "{join:' • '}",
              style: {
                lineHeight: "1.6"
              }
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 3. CREATIVE BOLD TEMPLATE
  // ==========================================
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Eye-catching design with sidebar and vibrant colors",
    imageUrl: `data:image/png;base64,${creativeImage}`,
    category: "creative",
    thumbnail: "/thumbnails/creative.png",

    theme: {
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        accent: "#c084fc",
        text: "#1e1b4b",
        background: "#faf5ff"
      },
      fonts: {
        heading: "font-bold",
        body: "font-normal"
      }
    },

    structure: {
      type: "grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        minHeight: "100vh",     // ✅ restore this line
        height: "100%",              // ✅ instead of minHeight: "100vh"
        width: "100%",
        margin: "0",                 // ✅ remove default page margin
        padding: "0",
        backgroundColor: "background"
      },

      sections: [
        // Sidebar
        {
          id: "sidebar",
          type: "sidebar",
          style: {
            backgroundColor: "primary",
            color: "#ffffff",
            padding: "32px"
          },
          sections: [
            // Profile
            {
              id: "profile",
              type: "section",
              style: {
                marginBottom: "32px"
              },
              elements: [
                {
                  type: "avatar",
                  dataPath: "basics.name",
                  style: {
                    width: "128px",
                    height: "128px",
                    borderRadius: "50%",
                    backgroundColor: "accent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    fontWeight: "bold",
                    margin: "0 auto 16px"
                  }
                },
                {
                  type: "text",
                  dataPath: "basics.name",
                  style: {
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "8px"
                  }
                },
                {
                  type: "text",
                  dataPath: "basics.label",
                  style: {
                    fontSize: "14px",
                    textAlign: "center",
                    opacity: "0.9"
                  }
                }
              ]
            },

            // Contact
            {
              id: "contact",
              type: "section",
              showTitle: true,
              title: "Contact",
              style: {
                marginBottom: "24px"
              },
              titleStyle: {
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.3)"
              },
              elements: [
                {
                  type: "contact-list",
                  style: {
                    fontSize: "14px"
                  },
                  itemStyle: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "8px"
                  },
                  items: [
                    { icon: "mail", dataPath: "basics.email" },
                    { icon: "phone", dataPath: "basics.phone" },
                    { icon: "map-pin", dataPath: "basics.location" }
                  ]
                }
              ]
            },

            // Skills
            {
              id: "skills",
              type: "section",
              showTitle: true,
              title: "Skills",
              style: {
                marginBottom: "24px"
              },
              titleStyle: {
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.3)"
              },
              elements: [
                {
                  type: "tag-list",
                  dataPath: "skills",
                  style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px"
                  },
                  tagStyle: {
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "accent"
                  }
                }
              ]
            },

            // Certifications
            {
              id: "awards",
              type: "repeatable-section",
              showTitle: true,
              title: "Certifications & Awards",
              dataPath: "certifications",
              titleStyle: {
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.3)"
              },
              itemStyle: {
                marginBottom: "8px"
              },
              elements: [
                {
                  type: "text",
                  dataPath: "name",
                  style: {
                    fontWeight: "600",
                    fontSize: "14px"
                  }
                },
                {
                  type: "text",
                  dataPath: "year",
                  style: {
                    fontSize: "12px",
                    opacity: "0.8"
                  }
                }
              ]
            }
          ]
        },

        // Main Content
        {
          id: "main-content",
          type: "main",
          style: {
            padding: "32px"
          },
          sections: [
            // About
            {
              id: "summary",
              type: "section",
              showTitle: true,
              title: "About Me",
              style: {
                marginBottom: "32px"
              },
              titleStyle: {
                fontSize: "24px",
                fontWeight: "bold",
                color: "primary",
                marginBottom: "12px"
              },
              elements: [
                {
                  type: "text",
                  dataPath: "basics.summary",
                  style: {
                    lineHeight: "1.6"
                  }
                }
              ]
            },

            // Experience
            {
              id: "experience",
              type: "repeatable-section",
              showTitle: true,
              title: "Experience",
              dataPath: "work",
              style: {
                marginBottom: "32px"
              },
              titleStyle: {
                fontSize: "24px",
                fontWeight: "bold",
                color: "primary",
                marginBottom: "16px"
              },
              itemStyle: {
                marginBottom: "24px",
                paddingBottom: "24px",
                borderBottom: "1px solid",
                borderColor: "secondary"
              },
              elements: [
                {
                  type: "text",
                  dataPath: "title",
                  style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "primary"
                  }
                },
                {
                  type: "text",
                  dataPath: "company",
                  style: {
                    fontWeight: "600",
                    marginBottom: "4px"
                  }
                },
                {
                  type: "text",
                  dataPath: "startDate",
                  template: "{startDate} - {endDate} | {location}",
                  style: {
                    fontSize: "14px",
                    color: "secondary",
                    marginBottom: "12px"
                  }
                },
                {
                  type: "list",
                  dataPath: "description",
                  listStyle: "custom",
                  listMarker: "▸",
                  style: {
                    marginLeft: "0"
                  },
                  itemStyle: {
                    display: "flex",
                    gap: "8px",
                    marginBottom: "4px"
                  },
                  markerStyle: {
                    color: "primary"
                  }
                }
              ]
            },

            // Education
            {
              id: "education",
              type: "repeatable-section",
              showTitle: true,
              title: "Education",
              dataPath: "education",
              titleStyle: {
                fontSize: "24px",
                fontWeight: "bold",
                color: "primary",
                marginBottom: "16px"
              },
              itemStyle: {
                marginBottom: "16px"
              },
              elements: [
                {
                  type: "text",
                  dataPath: "degree",
                  style: {
                    fontSize: "18px",
                    fontWeight: "bold"
                  }
                },
                {
                  type: "text",
                  dataPath: "institution",
                  style: {
                    fontWeight: "600"
                  }
                },
                {
                  type: "text",
                  dataPath: "year",
                  template: "{year} | GPA: {gpa}",
                  style: {
                    fontSize: "14px",
                    color: "secondary"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 4. MINIMAL CLEAN TEMPLATE
  // ==========================================
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Minimalist design focusing on content",
    imageUrl: `data:image/png;base64,${minimalImage}`,
    category: "minimal",
    thumbnail: "/thumbnails/minimal.png",

    theme: {
      colors: {
        primary: "#0f172a",
        secondary: "#475569",
        accent: "#334155",
        text: "#0f172a",
        background: "#ffffff"
      },
      fonts: {
        heading: "font-semibold",
        body: "font-light"
      }
    },

    structure: {
      type: "container",
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px",
        backgroundColor: "background",
        color: "text"
      },
      sections: [
        // Header
        {
          id: "header",
          type: "section",
          style: {
            marginBottom: "48px"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.name",
              style: {
                fontSize: "48px",
                fontWeight: "600",
                marginBottom: "8px"
              }
            },
            {
              type: "text",
              dataPath: "personalInfo.title",
              style: {
                fontSize: "20px",
                color: "secondary",
                marginBottom: "24px"
              }
            },
            {
              type: "contact-row",
              style: {
                display: "flex",
                gap: "24px",
                fontSize: "14px",
                color: "secondary"
              },
              items: [
                { dataPath: "personalInfo.email" },
                { dataPath: "personalInfo.phone" },
                { dataPath: "personalInfo.location" }
              ]
            }
          ]
        },

        // Summary
        {
          id: "summary",
          type: "section",
          style: {
            marginBottom: "40px"
          },
          elements: [
            {
              type: "text",
              dataPath: "personalInfo.summary",
              style: {
                fontSize: "18px",
                lineHeight: "1.6"
              }
            }
          ]
        },

        // Experience
        {
          id: "experience",
          type: "repeatable-section",
          showTitle: true,
          title: "Experience",
          dataPath: "experience",
          style: {
            marginBottom: "40px"
          },
          titleStyle: {
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: "600",
            color: "secondary",
            marginBottom: "24px"
          },
          itemStyle: {
            marginBottom: "32px"
          },
          elements: [
            {
              type: "flex-row",
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px"
              },
              elements: [
                {
                  type: "text",
                  dataPath: "title",
                  style: {
                    fontSize: "20px",
                    fontWeight: "600"
                  }
                },
                {
                  type: "text",
                  dataPath: "startDate",
                  template: "{startDate} — {endDate}",
                  style: {
                    fontSize: "14px",
                    color: "secondary"
                  }
                }
              ]
            },
            {
              type: "text",
              dataPath: "company",
              style: {
                color: "secondary",
                marginBottom: "12px"
              }
            },
            {
              type: "list",
              dataPath: "description",
              listStyle: "none",
              style: {
                marginLeft: "0"
              },
              itemStyle: {
                marginBottom: "8px",
                lineHeight: "1.6"
              }
            }
          ]
        },

        // Education
        {
          id: "education",
          type: "repeatable-section",
          showTitle: true,
          title: "Education",
          dataPath: "education",
          style: {
            marginBottom: "40px"
          },
          titleStyle: {
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: "600",
            color: "secondary",
            marginBottom: "24px"
          },
          itemStyle: {
            marginBottom: "16px"
          },
          elements: [
            {
              type: "flex-row",
              style: {
                display: "flex",
                justifyContent: "space-between"
              },
              elements: [
                {
                  type: "group",
                  elements: [
                    {
                      type: "text",
                      dataPath: "degree",
                      style: {
                        fontWeight: "600",
                        fontSize: "18px"
                      }
                    },
                    {
                      type: "text",
                      dataPath: "institution",
                      style: {
                        color: "secondary"
                      }
                    }
                  ]
                },
                {
                  type: "text",
                  dataPath: "year",
                  style: {
                    fontSize: "14px",
                    color: "secondary"
                  }
                }
              ]
            }
          ]
        },

        // Skills
        {
          id: "skills",
          type: "section",
          showTitle: true,
          title: "Skills",
          titleStyle: {
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: "600",
            color: "secondary",
            marginBottom: "24px"
          },
          elements: [
            {
              type: "text",
              dataPath: "skills",
              template: "{join:', '}",
              style: {
                fontSize: "18px",
                lineHeight: "1.6"
              }
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 5. Dark Vision TEMPLATE
  // ==========================================
{
  id: "dark-vision",
  name: "Dark Vision",
  description: "A bold dark theme with glowing accents and minimalist layout.",
  imageUrl: `data:image/png;base64,${darkVisionImage}`,
  category: "modern",
  thumbnail: "/thumbnails/dark-vision.png",

  theme: {
    colors: {
      primary: "#38bdf8",       // Cyan accent
      secondary: "#94a3b8",     // Muted gray-blue text
      background: "#0f172a",    // Deep navy-black background
      card: "#1e293b",          // Slightly lighter dark panels
      text: "#f1f5f9"           // Soft white text
    },
    fonts: {
      heading: "font-extrabold tracking-wide uppercase",
      body: "font-light"
    }
  },

  structure: {
    type: "container",
    style: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "48px 32px",
      backgroundColor: "background",
      color: "text"
    },
    sections: [
      // HEADER - Centered layout with glow
      {
        id: "header",
        type: "section",
        style: {
          textAlign: "center",
          marginBottom: "56px",
          paddingBottom: "24px",
          borderBottom: "2px solid",
          borderColor: "primary",
          boxShadow: "0 0 20px rgba(56,189,248,0.2)"
        },
        elements: [
          {
            type: "text",
            dataPath: "personalInfo.name",
            style: {
              fontSize: "42px",
              fontWeight: "900",
              color: "primary",
              marginBottom: "8px"
            }
          },
          {
            type: "text",
            dataPath: "personalInfo.title",
            style: {
              fontSize: "18px",
              color: "secondary",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px"
            }
          },
          {
            type: "contact-row",
            style: {
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              fontSize: "14px",
              color: "secondary"
            },
            items: [
              { icon: "mail", dataPath: "personalInfo.email" },
              { icon: "phone", dataPath: "personalInfo.phone" },
              { icon: "map-pin", dataPath: "personalInfo.location" }
            ]
          }
        ]
      },

      // SUMMARY - Wide glowing panel
      {
        id: "summary",
        type: "section",
        showTitle: true,
        title: "Profile",
        titleIcon: "file-text",
        style: {
          marginBottom: "40px",
          backgroundColor: "card",
          borderRadius: "12px",
          padding: "28px 32px",
          boxShadow: "0 0 25px rgba(56,189,248,0.1)"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "700",
          color: "primary",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        },
        elements: [
          {
            type: "text",
            dataPath: "personalInfo.summary",
            style: {
              lineHeight: "1.7",
              color: "secondary"
            }
          }
        ]
      },

      // EXPERIENCE - Vertical timeline layout
      {
        id: "experience",
        type: "repeatable-section",
        showTitle: true,
        title: "Experience",
        titleIcon: "briefcase",
        dataPath: "experience",
        style: {
          position: "relative",
          marginBottom: "48px",
          paddingLeft: "20px",
          borderLeft: "2px solid",
          borderColor: "primary"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "700",
          color: "primary",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        },
        itemStyle: {
          marginBottom: "32px",
          position: "relative"
        },
        elements: [
          {
            type: "circle-marker",
            style: {
              position: "absolute",
              left: "-30px",
              top: "4px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "primary",
              boxShadow: "0 0 10px rgba(56,189,248,0.6)"
            }
          },
          {
            type: "text",
            dataPath: "title",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "text",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "company",
            template: "{company} | {location}",
            style: {
              color: "secondary",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "startDate",
            template: "{startDate} - {endDate}",
            style: {
              fontSize: "13px",
              color: "secondary",
              marginBottom: "8px"
            }
          },
          {
            type: "list",
            dataPath: "description",
            listStyle: "none",
            style: {
              marginLeft: "8px",
              fontSize: "14px",
              color: "secondary"
            },
            itemStyle: {
              marginBottom: "4px",
              before: {
                content: "'▹ '",
                color: "primary"
              }
            }
          }
        ]
      },

      // EDUCATION - Compact dual column
      {
        id: "education",
        type: "repeatable-section",
        showTitle: true,
        title: "Education",
        titleIcon: "graduation-cap",
        dataPath: "education",
        style: {
          marginBottom: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "700",
          color: "primary",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        itemStyle: {
          backgroundColor: "card",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(56,189,248,0.08)"
        },
        elements: [
          {
            type: "text",
            dataPath: "degree",
            style: {
              fontSize: "17px",
              fontWeight: "bold",
              color: "text",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "institution",
            template: "{institution} | {location}",
            style: {
              color: "secondary",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "year",
            template: "Graduated: {year} | GPA: {gpa}",
            style: {
              fontSize: "13px",
              color: "secondary"
            }
          }
        ]
      },

      // SKILLS - Neon badge grid
      {
        id: "skills",
        type: "section",
        showTitle: true,
        title: "Skills",
        titleIcon: "award",
        style: {
          marginBottom: "32px"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "700",
          color: "primary",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        elements: [
          {
            type: "tag-list",
            dataPath: "skills",
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center"
            },
            tagStyle: {
              padding: "8px 14px",
              borderRadius: "18px",
              backgroundColor: "primary",
              color: "#0f172a",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 0 10px rgba(56,189,248,0.5)",
              transition: "all 0.2s ease"
            },
            hoverStyle: {
              transform: "scale(1.08)",
              boxShadow: "0 0 20px rgba(56,189,248,0.8)"
            }
          }
        ]
      }
    ]
  }
},

  // ==========================================
  // 6. NEO ELEGANT TEMPLATE
  // ==========================================




  {
  id: "neo-elegant",
  name: "Neo Elegant",
  description: "A sleek, modern layout with glass panels and subtle gradient accents.",
  imageUrl: `data:image/png;base64,${neoElegantImage}`,
  category: "creative",
  thumbnail: "/thumbnails/neo-elegant.png",

  theme: {
    colors: {
      primary: "#0f172a",        // Deep navy for titles
      secondary: "#475569",      // Muted slate for text
      accent: "#38bdf8",         // Soft cyan accent
      background: "#f8fafc",     // Light clean background
      card: "#ffffff"
    },
    fonts: {
      heading: "font-semibold",
      body: "font-light"
    }
  },

  structure: {
    type: "container",
    style: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "40px",
      backgroundColor: "background",
      color: "text"
    },
    sections: [
      // Header with split layout
      {
        id: "header",
        type: "section",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "48px",
          padding: "24px 32px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        },
        elements: [
          {
            type: "group",
            style: {
              flex: "1"
            },
            elements: [
              {
                type: "text",
                dataPath: "personalInfo.name",
                style: {
                  fontSize: "40px",
                  fontWeight: "700",
                  color: "primary",
                  marginBottom: "4px"
                }
              },
              {
                type: "text",
                dataPath: "personalInfo.title",
                style: {
                  fontSize: "18px",
                  color: "secondary"
                }
              }
            ]
          },
          {
            type: "contact-list",
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              fontSize: "14px",
              color: "secondary",
              gap: "8px"
            },
            items: [
              { icon: "mail", dataPath: "personalInfo.email" },
              { icon: "phone", dataPath: "personalInfo.phone" },
              { icon: "map-pin", dataPath: "personalInfo.location" }
            ]
          }
        ]
      },

      // Summary (Glass panel)
      {
        id: "summary",
        type: "section",
        showTitle: true,
        title: "About Me",
        titleIcon: "file-text",
        style: {
          marginBottom: "36px",
          backgroundColor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          padding: "24px 28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "primary",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        elements: [
          {
            type: "text",
            dataPath: "personalInfo.summary",
            style: {
              lineHeight: "1.6",
              color: "secondary"
            }
          }
        ]
      },

      // Experience (Card blocks)
      {
        id: "experience",
        type: "repeatable-section",
        showTitle: true,
        title: "Experience",
        titleIcon: "briefcase",
        dataPath: "experience",
        style: {
          marginBottom: "36px"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "primary",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        itemStyle: {
          backgroundColor: "card",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          borderLeft: "4px solid",
          borderColor: "accent"
        },
        elements: [
          {
            type: "text",
            dataPath: "title",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "primary",
              marginBottom: "6px"
            }
          },
          {
            type: "text",
            dataPath: "company",
            template: "{company} | {location}",
            style: {
              color: "secondary",
              marginBottom: "6px"
            }
          },
          {
            type: "text",
            dataPath: "startDate",
            template: "{startDate} - {endDate}",
            style: {
              fontSize: "13px",
              color: "secondary",
              marginBottom: "10px"
            }
          },
          {
            type: "list",
            dataPath: "description",
            listStyle: "circle",
            style: {
              marginLeft: "16px",
              fontSize: "14px",
              color: "secondary"
            }
          }
        ]
      },

      // Education (Two-column card layout)
      {
        id: "education",
        type: "repeatable-section",
        showTitle: true,
        title: "Education",
        titleIcon: "graduation-cap",
        dataPath: "education",
        style: {
          marginBottom: "36px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "primary",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        itemStyle: {
          backgroundColor: "card",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        },
        elements: [
          {
            type: "text",
            dataPath: "degree",
            style: {
              fontSize: "17px",
              fontWeight: "bold",
              color: "primary",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "institution",
            template: "{institution} | {location}",
            style: {
              color: "secondary",
              marginBottom: "4px"
            }
          },
          {
            type: "text",
            dataPath: "year",
            template: "Graduated: {year} | GPA: {gpa}",
            style: {
              fontSize: "13px",
              color: "secondary"
            }
          }
        ]
      },

      // Skills (Pill style with hover)
      {
        id: "skills",
        type: "section",
        showTitle: true,
        title: "Skills",
        titleIcon: "award",
        style: {
          marginBottom: "40px"
        },
        titleStyle: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "primary",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        },
        elements: [
          {
            type: "tag-list",
            dataPath: "skills",
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "10px"
            },
            tagStyle: {
              padding: "8px 14px",
              borderRadius: "20px",
              backgroundColor: "accent",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "500",
              transition: "transform 0.2s ease",
              cursor: "default"
            },
            hoverStyle: {
              transform: "scale(1.05)"
            }
          }
        ]
      }
    ]
  }
}

];


const seedDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);

    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB connected"))
      .catch((err) => console.error(err));

    await Template.deleteMany({});
    await Template.insertMany(templates);

    console.log('Database seeded!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
