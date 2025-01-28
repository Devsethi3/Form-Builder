import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const NotFoundPage = () => {
    return (
        <div className='error-page'>
            <div className="mars"></div>
            <Image 
                src="https://assets.codepen.io/1538474/404.svg" 
                alt="404 Error" 
                width={300}
                height={100}
                className="logo-404" 
            />
            <Image 
                src="https://assets.codepen.io/1538474/meteor.svg" 
                alt="Meteor" 
                width={100}
                height={100}
                className="meteor" 
            />
            <p className="title">Oh no!!</p>
            <p className="subtitle">
                You&apos;re either misspelling the URL <br /> or requesting a page that&apos;s no longer here.
            </p>
            <div className='text-center'>
                <Link href="/" className='text-xl py-3 px-8 bg-[#884DEE] hover:bg-[#673ab5] rounded-md text-white'>Back to Home</Link>
            </div>
            <Image 
                src="https://assets.codepen.io/1538474/astronaut.svg" 
                alt="Astronaut" 
                width={140}
                height={140}
                className="astronaut" 
            />
            <Image 
                src="https://assets.codepen.io/1538474/spaceship.svg" 
                alt="Spaceship" 
                width={140}
                height={140}
                className="spaceship" 
            />
        </div>
    );
};

export default NotFoundPage;
