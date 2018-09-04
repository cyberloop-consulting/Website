module.exports = () => ({
  author: "Alessandro Molari",
  keywords: [
    "Cyber Security",
    "Information Security",
    "Consulting",
    "Penetration Testing",
    "Red Teaming"
  ],
  description: "CyberLoop Consulting Official Website",
  hostname: "https://cyberloop.it",
  menu: {
    services: {
      title: "Services",
      sections: {
        overview: {
          title: "Overview",
          bgImageFileName: "TODO.jpg"
        },

        foo: {
          title: "Foo",
          items: [{ title: "Qwe", href: "rty" }]
        },

        bar: {
          title: "Bar",
          items: [
            { title: "Qwe", href: "rty" },
            {
              title: "Asd",
              href: "asd",
              subItems: [
                { title: "Iop", href: "iop" },
                { title: "Jkl", href: "jkl" },
                { title: "Bnm", href: "bnm" }
              ]
            },
            { title: "Zxc", href: "zxc" }
          ]
        }
      }
    },
    contact: {
      title: "Contact",
      sections: {
        overview: {
          title: "Overview",
          bgImageFileName: "TODO.jpg"
        },

        foo: {
          title: "Foo",
          items: [{ title: "Qwe", href: "rty" }]
        },

        bar: {
          title: "Bar",
          items: [
            { title: "Qwe", href: "rty" },
            {
              title: "Asd",
              href: "asd",
              subItems: [
                { title: "Iop", href: "iop" },
                { title: "Jkl", href: "jkl" },
                { title: "Bnm", href: "bnm" }
              ]
            },
            { title: "Zxc", href: "zxc" }
          ]
        }
      }
    }
  }
});
