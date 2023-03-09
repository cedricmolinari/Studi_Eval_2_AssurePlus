export default function success(result) {
    return {
        status: 'success',
        result: result
    }
}

export function error(message) {
    return {
        status: 'error',
        message: message
    }
}