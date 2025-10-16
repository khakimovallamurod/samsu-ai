<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");




function get_url() {
    $url =  'https://samdu.zapier.app/api/chat';
    if (!$url) {
        throw new Exception("URL not found in .env file");
    }
    return $url;
}

function decode_response_text($resp_text) {

    preg_match_all('/0:"(.*?)"/', $resp_text, $matches);

    $joined = implode("", $matches[1]);

    $decoded = stripcslashes(mb_convert_encoding($joined, "UTF-8"));
    return trim($decoded);
}


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input || !isset($input['message'])) {
        http_response_code(400);
        echo json_encode(["error" => "Iltimos, 'message' maydonini yuboring."]);
        exit;
    }

    $user_message = $input['message'];
    $payload = [
        "blockId" => "cmgroxc0l0009nqgqabp29veu",
        "params" => [
            "params" => [
                "publishedPageParams" => ["samdu"]
            ]
        ],
        "stream" => true,
        "chatbotSessionId" => "cmgrxwbgc015z5l0y9h8dixna",
        "predictionId" => "853ff38c-b601-497e-b503-176bbfa73be3",
        "message" => [
            "content" => $user_message,
            "parts" => [
                ["type" => "text", "text" => $user_message]
            ],
            "role" => "user"
        ]
    ];

    $url = get_url();

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result_text = decode_response_text($response);
    if ($httpcode != 200) {
        echo json_encode([
            "status" => "error",
            "user_message" => $user_message,
            "response" => null
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "user_message" => $user_message,
        "response" => $result_text
    ]);

} else {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "response" => "Method not allowed!"
    ]);
}
