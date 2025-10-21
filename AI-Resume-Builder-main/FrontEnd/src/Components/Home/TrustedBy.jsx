import React from 'react';

const companies = [
  { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
  { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'Philips', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/750px-Philips_logo_new.svg.png?20151112003148' },
  { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png?20230620122121' },
  { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'Apple', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
];

export default function TrustedBy() {
  return (
    <div className="py-16 bg-gray-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-lg font-semibold text-gray-400 mb-8">
          TRUSTED BY TALENT AT TOP COMPANIES
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {companies.map((company) => (
            <div key={company.name} className="h-8">
              <img
                src={company.url}
                alt={company.name}
                className="h-full w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                style={{
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}