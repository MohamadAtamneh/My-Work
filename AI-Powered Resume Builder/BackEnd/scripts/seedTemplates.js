import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from '../models/Template.js';



const templates = [
  // ==========================================
  // 1. MODERN PROFESSIONAL TEMPLATE
  // ==========================================
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean and contemporary design with accent borders",
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
        minHeight: "100vh",
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
                  dataPath: "personalInfo.name",
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
                  dataPath: "personalInfo.name",
                  style: {
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "8px"
                  }
                },
                {
                  type: "text",
                  dataPath: "personalInfo.title",
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
                    { icon: "mail", dataPath: "personalInfo.email" },
                    { icon: "phone", dataPath: "personalInfo.phone" },
                    { icon: "map-pin", dataPath: "personalInfo.location" }
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
              id: "certifications",
              type: "repeatable-section",
              showTitle: true,
              title: "Certifications",
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
              id: "about",
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
                  dataPath: "personalInfo.summary",
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
              dataPath: "experience",
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
  }
];

dotenv.config(); // Must come before using process.env

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
