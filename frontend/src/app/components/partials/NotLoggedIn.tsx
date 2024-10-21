import { Link } from 'react-router-dom';

function NotLoggedIn() {
  return (
    <div className="flex flex-col items-center justify-center calc-h-vw-2">
      <img src="/catError.webp" alt="" className="mb-4 w-full max-w-[684px]" />

      <h1 className="mb-4 text-4xl font-bold text-white">You Are Not Logged In</h1>
      <p className="text-lg text-gray-300 hover:underline">
        <Link to="/login">
          Please log in to access this page. <br />
          <span className="text-sm">(Click here to login)</span>
        </Link>
      </p>
    </div>
  );
}

export default NotLoggedIn;
